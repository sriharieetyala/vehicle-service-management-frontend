import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-count-up',
    standalone: true,
    template: `{{ displayValue }}`,
    styles: [`
        :host {
            display: inline-block;
        }
    `]
})
export class CountUpComponent implements OnChanges {
    @Input() endValue: number = 0;
    @Input() duration: number = 800; // ms

    displayValue: number = 0;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['endValue']) {
            this.animateCount();
        }
    }

    private animateCount(): void {
        const startValue = 0;
        const endValue = this.endValue;
        const duration = this.duration;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out effect
            const easeOut = 1 - Math.pow(1 - progress, 3);
            this.displayValue = Math.floor(startValue + (endValue - startValue) * easeOut);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.displayValue = endValue;
            }
        };

        requestAnimationFrame(animate);
    }
}
