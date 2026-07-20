import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AiChatService } from '../../../services/ai-chat';
import { RestaurantConfigService } from '../../../services/admin/restaurant-config';
import { NotificationServices } from '../../../services/notification-services';
import { ChatMessage } from '../../../models/ai-chat.models';
import { RestaurantConfig } from '../../../models/restaurant-config.model';

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const SUGGESTION_CHIPS = [
  { label: 'Recommend a dish', prompt: 'Can you recommend a popular dish?' },
  { label: 'Vegetarian options', prompt: 'What vegetarian options do you have?' },
  { label: 'Vegan dishes', prompt: 'What vegan dishes are available?' },
  { label: 'High protein meals', prompt: 'Which dishes are high in protein?' },
  { label: 'Allergies', prompt: 'What allergen information can you provide about your menu?' },
  { label: "Today's specials", prompt: "What are today's specials?" },
  { label: 'Restaurant timings', prompt: 'What are your opening and closing hours?' },
  { label: 'Payment methods', prompt: 'What payment methods do you accept?' },
];

export const EMPTY_STATE_PROMPTS = [
  'Recommend a spicy starter',
  'What dishes are vegetarian?',
  'Does Butter Chicken contain dairy?',
  'What payment methods do you accept?',
  'Is there parking available?',
];

@Component({
  selector: 'app-ai-dining-assistant',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './ai-dining-assistant.html',
  styleUrl: './ai-dining-assistant.css',
})
export class AiDiningAssistant implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputField') private inputField!: ElementRef<HTMLTextAreaElement>;

  private readonly aiChatService = inject(AiChatService);
  private readonly restaurantConfigService = inject(RestaurantConfigService);
  private readonly notification = inject(NotificationServices);

  // ── State ────────────────────────────────────────────────────────────────
  messages = signal<ChatMessage[]>([]);
  inputText = signal<string>('');
  isLoading = signal<boolean>(false);
  restaurantConfig = signal<RestaurantConfig | null>(null);

  private conversationId = generateUuid();
  private shouldScrollToBottom = false;

  // ── Computed ─────────────────────────────────────────────────────────────
  readonly isEmpty = computed(() => this.messages().length === 0);
  readonly canSend = computed(
    () => this.inputText().trim().length > 0 && !this.isLoading()
  );

  readonly restaurantStatus = computed(() => {
    const config = this.restaurantConfig();
    if (!config?.openingTime || !config?.closingTime) return 'Open';
    const now = new Date();
    const [openH, openM] = config.openingTime.split(':').map(Number);
    const [closeH, closeM] = config.closingTime.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;
    return nowMins >= openMins && nowMins < closeMins ? 'Open' : 'Closed';
  });

  readonly chips = SUGGESTION_CHIPS;
  readonly emptyStatePrompts = EMPTY_STATE_PROMPTS;

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.restaurantConfigService.getConfig().subscribe({
      next: (config) => this.restaurantConfig.set(config),
      error: () => { /* non-critical: panel shows graceful fallback */ },
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // ── Public Actions ───────────────────────────────────────────────────────
  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onInputChange(el: HTMLTextAreaElement): void {
    this.inputText.set(el.value);
    this.autoResize(el);
  }

  sendChip(prompt: string): void {
    this.inputText.set(prompt);
    this.sendMessage();
  }

  sendEmptyStatePrompt(prompt: string): void {
    this.inputText.set(prompt);
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.inputText().trim();
    if (!text || this.isLoading()) return;

    // Append user message immediately
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    this.messages.update((msgs) => [...msgs, userMessage]);
    this.inputText.set('');
    this.resetInputHeight();
    this.isLoading.set(true);
    this.shouldScrollToBottom = true;

    this.aiChatService
      .sendMessage({ conversationId: this.conversationId, message: text })
      .subscribe({
        next: (res) => {
          const assistantMessage: ChatMessage = {
            id: generateMessageId(),
            role: 'assistant',
            content: res.response,
            timestamp: new Date(),
          };
          this.messages.update((msgs) => [...msgs, assistantMessage]);
          this.isLoading.set(false);
          this.shouldScrollToBottom = true;
        },
        error: () => {
          this.notification.error('Failed to get a response. Please try again.');
          this.isLoading.set(false);
          this.shouldScrollToBottom = true;
        },
      });
  }

  // ── Markdown renderer (lightweight, no external lib needed) ──────────────
  renderMarkdown(text: string): string {
    let html = text
      // Escape HTML entities first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Code blocks (``` ... ```)
      .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Unordered list items (lines starting with - or *)
      .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
      // Ordered list items
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // Headings
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      // Line breaks — double newline = paragraph, single = <br>
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraph if not already block-level
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }
    return html;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ── Private ──────────────────────────────────────────────────────────────
  private autoResize(el: HTMLTextAreaElement): void {
    // Line height is ~22px; cap at 4 lines (88px) then scroll inside
    const maxHeight = 22 * 4;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  private resetInputHeight(): void {
    const el = this.inputField?.nativeElement;
    if (el) {
      el.style.height = 'auto';
      el.style.overflowY = 'hidden';
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* ignore */ }
  }
}
