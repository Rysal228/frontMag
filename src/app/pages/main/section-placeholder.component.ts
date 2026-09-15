import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-section-placeholder',
  standalone: true,
  template: `
    <section class="placeholder">
      <h1>{{ title }}</h1>
      <p>Раздел пока находится в разработке.</p>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .placeholder {
      padding: 32px 20px;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = this.route.snapshot.data['title'] as string;
}
