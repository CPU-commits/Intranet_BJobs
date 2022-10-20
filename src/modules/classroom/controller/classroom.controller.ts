import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { CloseStudentForm } from '../models/close_form.model'
import { ClassroomService } from '../service/classroom.service'

@Controller('classroom')
export class ClassroomController {
    constructor(private readonly classroomService: ClassroomService) {}

    @EventPattern('close_student_form')
    closeStudentForm(@Payload() data: CloseStudentForm) {
        this.classroomService.closeForm(
            `in ${data.Diff} hours`,
            data.Work,
            data.Student,
        )
    }

    @EventPattern('close_semester')
    closeSemester() {
        this.classroomService.closeSemester()
    }

    @EventPattern('interrupt_finish_semester')
    interruptFinishSemester() {
        this.classroomService.interruptFinishSemester()
    }
}
