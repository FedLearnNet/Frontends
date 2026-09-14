import { Injectable, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';
import { LARGE, MEDIUM, SMALL, XLARGE, XSMALL } from '../constants';

@Injectable({
    providedIn: 'root'
})
export class ResponsiveService {
    private breakpointObserver = inject(BreakpointObserver);

    isMobile(): Observable<boolean> {
        return this.breakpointObserver
            .observe(Breakpoints.Handset)
            .pipe(map((result) => result.matches));
    }

    isTablet(): Observable<boolean> {
        return this.breakpointObserver
            .observe(Breakpoints.Tablet)
            .pipe(map((result) => result.matches));
    }

    isDesktop(): Observable<boolean> {
        return this.breakpointObserver
            .observe(Breakpoints.Web)
            .pipe(map((result) => result.matches));
    }

    getScreenSize(): Observable<string> {
        return this.breakpointObserver
            .observe([
                Breakpoints.XSmall,
                Breakpoints.Small,
                Breakpoints.Medium,
                Breakpoints.Large,
                Breakpoints.XLarge,
            ])
            .pipe(
                map((result) => {
                    if (result.breakpoints[Breakpoints.XSmall]) {
                        return XSMALL;
                    } else if (result.breakpoints[Breakpoints.Small]) {
                        return SMALL;
                    } else if (result.breakpoints[Breakpoints.Medium]) {
                        return MEDIUM;
                    } else if (result.breakpoints[Breakpoints.Large]) {
                        return LARGE;
                    } else if (result.breakpoints[Breakpoints.XLarge]) {
                        return XLARGE;
                    } else {
                        return 'unknown';
                    }
                })
            );
    }

    isScreenSizeGreaterThan(breakpoint: string): Observable<boolean> {
        return this.breakpointObserver
            .observe([
                Breakpoints.XSmall,
                Breakpoints.Small,
                Breakpoints.Medium,
                Breakpoints.Large,
                Breakpoints.XLarge,
            ])
            .pipe(
                map((result) => {
                    switch (breakpoint) {
                        case XSMALL:
                            return !result.breakpoints[Breakpoints.XSmall];
                        case SMALL:
                            return !(result.breakpoints[Breakpoints.XSmall]
                                || result.breakpoints[Breakpoints.Small]);
                        case MEDIUM:
                            return !(result.breakpoints[Breakpoints.XSmall]
                                || result.breakpoints[Breakpoints.Small]
                                || result.breakpoints[Breakpoints.Medium]);
                        case LARGE:
                            return !(result.breakpoints[Breakpoints.XSmall]
                                || result.breakpoints[Breakpoints.Small]
                                || result.breakpoints[Breakpoints.Medium]
                                || result.breakpoints[Breakpoints.Large]);
                        case XLARGE:
                            return !result.breakpoints[Breakpoints.XLarge];
                        default:
                            return false;
                    }
                })
            );
    }
}
