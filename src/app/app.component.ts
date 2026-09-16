import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TuiRoot } from '@taiga-ui/core';

import { AppInitializationService } from './shared/services/max/app-initialization.service';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  protected readonly initialization = inject(AppInitializationService);
  private readonly themeService = inject(ThemeService);

  protected readonly theme = this.themeService.theme;

  ngOnInit(): void {
    console.log('this.initData:', window.WebApp?.initData);
    // const mockData = {
    //   initData:
    //     'hash=81e28a66f105cd70bcc4ea9bdb2b187831287fa54481b8901170e0c1582e1c17&auth_date=1788938960&query_id=9cf201bc-eb19-4ebb-958e-3aa23390ded6&user=%7B%22id%22%3A295596125%2C%22first_name%22%3A%22%D0%A1%D0%B5%D1%80%D0%B3%D0%B5%D0%B9%22%2C%22last_name%22%3A%22%22%2C%22username%22%3Anull%2C%22language_code%22%3A%22ru%22%2C%22photo_url%22%3Anull%7D&ip=176.116.167.134&chat=%7B%22id%22%3A1147715%2C%22type%22%3A%22DIALOG%22%7D',
    // };
    // this.http
    //   .post<any>('http://localhost:3000/validate', mockData)
    //   .subscribe((value) => console.log('response:', value));
    // window.WebApp?.requestContact().then(({ phone }) => {
    //   console.log(`Номер телефона пользователя ${phone}`);
    // });
    // console.log('initialization:', this.initialization.state());
  }
}
