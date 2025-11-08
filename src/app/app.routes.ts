import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Venue } from './venue/venue';
import { Event } from './event/event';

export const routes: Routes = [
    {
        path: '',
        component: Home,
    },

    {
        path: 'event',
        component: Event,
    },

    {
        path: 'venue',
        component: Venue,
    }
];
