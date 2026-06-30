import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-admin-home',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome implements OnInit {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly pageTitle = signal('Admin Portal');
  readonly navOpen = signal(false);

  ngOnInit(): void {
    this.updatePageTitle();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.getDeepestRoute(this.route))
      )
      .subscribe(childRoute => {
        this.pageTitle.set(childRoute.snapshot.data['title'] ?? 'Admin Portal');
        // close drawer on navigation
        this.navOpen.set(false);
      });
  }

  toggleNav(): void {
    this.navOpen.update(v => !v);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }

  private updatePageTitle(): void {
    const childRoute = this.getDeepestRoute(this.route);
    this.pageTitle.set(childRoute.snapshot.data['title'] ?? 'Admin Portal');
  }

  private getDeepestRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
