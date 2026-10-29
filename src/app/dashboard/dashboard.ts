import { Component } from '@angular/core';
import { Header } from './shared/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Header,RouterOutlet],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  
}
