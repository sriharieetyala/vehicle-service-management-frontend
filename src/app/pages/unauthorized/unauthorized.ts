import { Component } from '@angular/core';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [],
    template: `
        <div class="container">
            <h1>404</h1>
            <p>Page not found</p>
            <a (click)="goBack()">Go back</a>
        </div>
    `,
    styles: [`
        .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            font-family: system-ui, sans-serif;
            text-align: center;
        }
        h1 {
            font-size: 100px;
            font-weight: 700;
            color: #94a3b8;
            margin: 0;
        }
        p {
            color: #64748b;
            margin: 8px 0 16px;
        }
        a {
            color: #3b82f6;
            text-decoration: underline;
        }
    `]
})
export class UnauthorizedPage {
    goBack(): void {
        window.history.back();
    }
}
