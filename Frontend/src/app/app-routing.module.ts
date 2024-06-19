import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpeechDetectionComponent } from './speech-detection/speech-detection.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'speech-detection', pathMatch: "full" },
  { path: 'speech-detection', component: SpeechDetectionComponent },
  { path: 'dashboard', component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
