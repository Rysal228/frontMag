import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription, interval } from 'rxjs';

import { TuiRoot } from '@taiga-ui/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private isMaxBrightness = false;
  private brightnessSub?: Subscription;

  ngOnInit(): void {
    //   window.WebApp.ScreenCapture.disableScreenCapture().then(({isScreenCaptureEnabled}) => {
    //     console.log('Отключена возможность захвата экрана')
    // });
    // this.brightnessSub = interval(6000).subscribe(() =>
    //   this.toggleBrightness()
    // );
    //   const data = window.WebApp.initData;
    //   console.log('initData:', data);
    //   window.WebApp.requestContact().then(({phone}) => {
    //     console.log(`Номер телефона пользователя ${phone}`)
    // });
    window.WebApp.openMaxLink('https://www.twitch.tv/madarapoe');
  }

  openLink() {
    window.WebApp.openMaxLink('https://www.twitch.tv/madarapoe');
  }

  ngOnDestroy(): void {
    this.brightnessSub?.unsubscribe();
  }

  private async debugViewport() {
    const webAppViewport = await window.WebApp.getViewportSize();

    console.log({
      webAppViewport,
      windowInner: { width: window.innerWidth, height: window.innerHeight },
      documentClient: {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
      },
      devicePixelRatio: window.devicePixelRatio,
      visualViewport: window.visualViewport
        ? {
            width: window.visualViewport.width,
            height: window.visualViewport.height,
          }
        : null,
    });
  }

  private async toggleBrightness(): Promise<void> {
    try {
      if (!this.isMaxBrightness) {
        const { isScreenCaptureEnabled } = await window.WebApp.ScreenCapture.disableScreenCapture();
        console.log('Отключена возможность захвата экрана:', isScreenCaptureEnabled);
      } else {
        const { isScreenCaptureEnabled } = await window.WebApp.ScreenCapture.enableScreenCapture();
        console.log('Включена возможность захвата экрана:', isScreenCaptureEnabled);
      }
      this.isMaxBrightness = !this.isMaxBrightness;
    } catch (error) {
      console.error('Не удалось запретить захват кэрана:', error);
    }
  }
}
