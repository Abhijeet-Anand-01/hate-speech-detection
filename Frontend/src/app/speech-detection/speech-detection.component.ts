import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { AppService } from '../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-speech-detection',
  templateUrl: './speech-detection.component.html',
  styleUrls: ['./speech-detection.component.scss'],
  providers: [MessageService]
})
export class SpeechDetectionComponent implements OnInit {
  username: string = "";
  speech: string = "";

  data: any;

  options: any;


  messages!: Message[];


  items!: any[];

  basicData: any;

  basicOptions: any;
  allDataByUsers: any;

  constructor(private messageService: MessageService, private appService: AppService, private router: Router) { }

  ngOnInit() {
    this.appService.getUsers().subscribe({
      next: (res: any) => {
        this.allDataByUsers = res;
      }
    })

    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-external-link',
        command: () => {
          this.router.navigate(['/dashboard'], { queryParams: { username: this.username.toLowerCase() } })
        }

      }
    ];


    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--primary-color-text');
    const textColorSecondary = documentStyle.getPropertyValue('--primary-color-text');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.basicData = {
      labels: ['Toxic', 'Severe Toxic', 'Obscene', 'Threat', 'Insult', 'Identity hate'],
      datasets: [
        {
          label: 'Hate Speech categorization                        X: Classes   Y: Prediction Percentage',
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: ['rgba(255, 159, 64, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(125, 159, 64, 0.7)', 'rgba(7, 112, 252, 0.7)'],
          borderColor: ['rgb(255, 159, 64)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgba(125, 159, 64)', 'rgba(7, 112, 252)'],
          borderWidth: 1
        }
      ]
    };

    this.basicOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  testHate() {
    this.appService.postPredictText(this.speech).subscribe({
      next: (res: any) => {
        this.basicData = {
          labels: ['Toxic', 'Severe Toxic', 'Obscene', 'Threat', 'Insult', 'Identity hate'],
          datasets: [
            {
              label: 'Hate Speech categorization                        X: Classes   Y: Prediction Percentage',
              data: res.predictions,
              backgroundColor: ['rgba(255, 159, 64, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(125, 159, 64, 0.7)', 'rgba(7, 112, 252, 0.7)'],
              borderColor: ['rgb(255, 159, 64)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgba(125, 159, 64)', 'rgba(7, 112, 252)'],
              borderWidth: 1
            }
          ]
        };


        this.updateUserMonthlyData(this.allDataByUsers, this.username, res.predictions);

        this.appService.postUsers(this.allDataByUsers).subscribe({
          next: (res: any) => {
            console.log(res);
            
          }
        })

      }
    })




  }


  updateUserMonthlyData(data: any, username: string, array: any) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const date = new Date();
    const month = months[date.getMonth()];

    let user = data.users.find((u: any) => u.username === username);

    if (user) {
      if (user.monthlyData[month]) {
        user.monthlyData[month].push(array);
      } else {
        user.monthlyData[month] = [array];
      }
    } else {
      const newUser = {
        username: username,
        monthlyData: {
          [month]: [array]
        }
      };
      data.users.push(newUser);
    }
  }

  resetSpeech() {
    this.messageService.clear();
  }
}
