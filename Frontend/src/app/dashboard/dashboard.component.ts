import { Component } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  allDataByUsers: any;
  selectedUsername!: string;
  userData: any;
  monthWiseForSelectedUser: any;


  constructor(private appService: AppService, private route: ActivatedRoute) { }


  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      this.selectedUsername = queryParams['username'];

      this.appService.getUsers().subscribe({
        next: (res: any) => {
          this.allDataByUsers = res;
          console.log(res.users);

          this.userData = this.allDataByUsers.users?.find((item: any) => item.username === this.selectedUsername)?.monthlyData;

          console.log(this.userData);
          this.renderGraphs();

        }
      })

    });


    //     this.userData = this.allDataByUsers.users.find((user: any) => user.username === "Abhinav")?.monthlyData;
    //     this.monthWiseForSelectedUser = this.calculateHateNoHate(userData);
    // // console.log(userData);

    //     console.log(this.monthWiseForSelectedUser);

    //     this.getPieChart();
    //     this.getPolarAreaChart();
    //     this.getLineChart();
    //     this.getStackedBarChart();
  }

  getUsername() {
    this.userData = this.allDataByUsers.users?.find((item: any) => item.username === this.selectedUsername)?.monthlyData;
    this.renderGraphs();
  }


  renderGraphs() {
    this.monthWiseForSelectedUser = this.calculateHateNoHate(this.userData);
    const months: any = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Sort the data by the month order
    const sortedData: any = {};
    months.forEach((month: any) => {
      if (this.monthWiseForSelectedUser[month]) {
        sortedData[month] = this.monthWiseForSelectedUser[month];
      }
    });

    this.monthWiseForSelectedUser = sortedData;
    console.log(this.monthWiseForSelectedUser);

    this.getPieChart();
    this.getPolarAreaChart();
    this.getLineChart();
    this.getStackedBarChart();
  }

  calculateHateNoHate(monthlyData: any) {
    let result: any = {};

    for (let month in monthlyData) {
      let hateCount = 0;
      let hateTypes: any = [];

      monthlyData[month].forEach((arr: any) => {
        if (arr.some((element: any) => element > 2)) {
          hateCount++;
        }
        arr.forEach((element: any, index: any) => {
          hateTypes[index] = (hateTypes[index] || 0) + element;
        });
      });

      hateTypes = hateTypes.map((value: any) => value / 100);

      let noHateCount = monthlyData[month].length - hateCount;

      result[month] = {
        hate: hateCount,
        noHate: noHateCount,
        hateTypes: hateTypes
      };
    }

    return result;
  }



  pieChartData: any;
  pieChartOptions: any;

  getPieChart() {
    let sumHate = 0;
    let sumNoHate = 0;

    for (const month in this.monthWiseForSelectedUser) {
      if (this.monthWiseForSelectedUser.hasOwnProperty(month)) {
        sumHate += this.monthWiseForSelectedUser[month].hate;
        sumNoHate += this.monthWiseForSelectedUser[month].noHate;
      }
    }

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--primary-color-text');

    this.pieChartData = {
      labels: ['Hate', 'No Hate'],
      datasets: [
        {
          data: [sumHate, sumNoHate],
          backgroundColor: [
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--green-500')
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--red-400'),
            documentStyle.getPropertyValue('--green-400')
          ]
        }
      ]
    };

    this.pieChartOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor
          }
        }
      }
    };
  }


  polarAreaData: any;

  polarAreaOptions: any;

  getPolarAreaChart() {
    const sumHateTypes = new Array(6).fill(0);
    const totalMonths = Object.keys(this.monthWiseForSelectedUser).length;

    for (const month in this.monthWiseForSelectedUser) {
      if (this.monthWiseForSelectedUser.hasOwnProperty(month)) {
        this.monthWiseForSelectedUser[month].hateTypes.forEach((value: any, index: number) => {
          sumHateTypes[index] += value;
        });
      }
    }

    const averages = sumHateTypes.map(sum => sum / totalMonths);

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--primary-color-text');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.polarAreaData = {
      datasets: [
        {
          data: averages,
          backgroundColor: [
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--bluegray-500'),
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--pink-500')
          ]
        }
      ],
      labels: ['Toxic', 'Severe Toxic', 'Obscene', 'Threat', 'Insult', 'Identity hate']
    };

    this.polarAreaOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        r: {
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }



  lineChartData: any;

  lineChartOptions: any;

  getLineChart() {
    // Extracting the month array
    const monthArray = Object.keys(this.monthWiseForSelectedUser);

    // Extracting the hate array month-wise
    const hateArray = monthArray.map(month => this.monthWiseForSelectedUser[month].hate);

    // Extracting the noHate array month-wise
    const noHateArray = monthArray.map(month => this.monthWiseForSelectedUser[month].noHate);


    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--primary-color-text');
    const textColorSecondary = documentStyle.getPropertyValue('--primary-color-text');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.lineChartData = {
      labels: monthArray,
      datasets: [
        {
          label: 'Hate',
          data: hateArray,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--red-500'),
          tension: 0.4
        },
        {
          label: 'No Hate',
          data: noHateArray,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--green-500'),
          tension: 0.4
        }
      ]
    };

    this.lineChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
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


  data: any;

  options: any;

  getStackedBarChart() {

    // Extracting the month array
    const monthArray = Object.keys(this.monthWiseForSelectedUser);

    let array0 = [];
    let array1 = [];
    let array2 = [];
    let array3 = [];
    let array4 = [];
    let array5 = [];

    // Extract the hateTypes values into separate arrays
    for (let month in this.monthWiseForSelectedUser) {
      array0.push(this.monthWiseForSelectedUser[month]["hateTypes"][0]);
      array1.push(this.monthWiseForSelectedUser[month]["hateTypes"][1]);
      array2.push(this.monthWiseForSelectedUser[month]["hateTypes"][2]);
      array3.push(this.monthWiseForSelectedUser[month]["hateTypes"][3]);
      array4.push(this.monthWiseForSelectedUser[month]["hateTypes"][4]);
      array5.push(this.monthWiseForSelectedUser[month]["hateTypes"][5]);
    }

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--primary-color-text');
    const textColorSecondary = documentStyle.getPropertyValue('--primary-color-text');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.data = {
      labels: monthArray,
      datasets: [
        {
          type: 'bar',
          label: 'Toxic',
          backgroundColor: documentStyle.getPropertyValue('--red-500'),
          data: array0
        },
        {
          type: 'bar',
          label: 'Severe Toxic',
          backgroundColor: documentStyle.getPropertyValue('--green-500'),
          data: array1
        },
        {
          type: 'bar',
          label: 'Obscene',
          backgroundColor: documentStyle.getPropertyValue('--yellow-500'),
          data: array2
        },
        {
          type: 'bar',
          label: 'Threat',
          backgroundColor: documentStyle.getPropertyValue('--bluegray-500'),
          data: array3
        },
        {
          type: 'bar',
          label: 'Insult',
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          data: array4
        },
        {
          type: 'bar',
          label: 'Identity hate',
          backgroundColor: documentStyle.getPropertyValue('--pink-500'),
          data: array5
        }
      ]
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        tooltips: {
          mode: 'index',
          intersect: false
        },
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          stacked: true,
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

}
