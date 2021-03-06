import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { concatMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Instructor } from 'src/app/common/instructor';
import { TrainingSession } from 'src/app/common/training-session';
import { User } from 'src/app/common/user';
import { InstructorService } from 'src/app/services/instructor.service';
import { TrainingSessionService } from 'src/app/services/training-session.service';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-instructor-schedule',
  templateUrl: './instructor-schedule.component.html',
  styleUrls: ['./instructor-schedule.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class InstructorScheduleComponent implements OnInit {
  instructor: Instructor = null;
  user: User = null;
  trainingSessions: TrainingSession[] = [];
  trainingSessionsForSearch: TrainingSession[] = [];
  trainingSessionsByDays: any[][] = [
    [], [], [], [], [], [], []
  ];


  constructor(private route: ActivatedRoute,
    private instructorService: InstructorService,
    private utilService: UtilService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private trainingSessionService: TrainingSessionService
  ) { }

  ngOnInit(): void {
    this.init();
  }

  init() {
    const instructorId: number = +this.route.snapshot.paramMap.get('id');
    if (this.authService.isLoggedIn()) {
      this.authService.getUser().pipe(concatMap(data => {
        this.user = data;
        return new Promise(resolve => setTimeout(() => resolve(data), 500));
      })).subscribe((value: any) => {
        this.utilService.getTrainingSessionsByAvailableForUser(+this.user.id).pipe(concatMap(value => {
          this.trainingSessionsForSearch = value;
          return new Promise(resolve => setTimeout(() => resolve(value), 500));
        }))
          .subscribe((value: any) => {
            this.instructorService.getInstructor(instructorId).pipe(concatMap(
              data => {
                this.instructor = data.payload;
                this.trainingSessionsForSearch.forEach(session => {
                  data.payload.trainingSessions.forEach(instrSesssion => {
                    if (instrSesssion === session.id) {
                      this.trainingSessions.push(session);
                    }
                  })
                })
                return new Promise(resolve => setTimeout(() => resolve(value), 500));
              }
            )).subscribe((value: any) => {
              this.filterTrainingSessionsByDays();
            })
          })
      })
    } else {
      this.trainingSessionService.getTrainingSessionByInstructor(instructorId).subscribe(value => {
        this.trainingSessions = value;
        this.filterTrainingSessionsByDays();
      })
    }
  }

  filterTrainingSessionsByDays() {
    this.trainingSessions.forEach(session => {
      if (session.day === "H??tf??")
        this.trainingSessionsByDays[0].push(session);

      else if (session.day === "Kedd")
        this.trainingSessionsByDays[1].push(session);

      else if (session.day === "Szerda")
        this.trainingSessionsByDays[2].push(session);

      else if (session.day === "Cs??t??rt??k")
        this.trainingSessionsByDays[3].push(session);

      else if (session.day === "P??ntek")
        this.trainingSessionsByDays[4].push(session);

      else if (session.day === "Szombat")
        this.trainingSessionsByDays[5].push(session);

      else if (session.day === "Vas??rnap")
        this.trainingSessionsByDays[6].push(session);
    })
  }

  addTrainingSession(session: TrainingSession) {
    if (this.authService.isLoggedIn()) {
      this.userService.addTrainingSession(+this.user.id, session.id).subscribe();
      this.confirmationService.confirm({
        message: 'Jelentkez??se erre az id??pontra megt??rt??nt, tov??bbi inform??ci??k??rt az oktat??nk keresni fogja ??nt. Jelentkez??seit megtekintheti a szem??lyes adatok men??pontban',
        header: 'Sikeres jelentkez??s',
        icon: 'fa fa-check',
        accept: () => {
          location.reload();
        }
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Jelentkezz be', detail: `Jelentkez??s edz??s id??pontokra csak bejelentkez??s ut??n lehets??ges`, life: 4000 });
    }
  }
}
