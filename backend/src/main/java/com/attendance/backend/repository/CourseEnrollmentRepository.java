package com.attendance.backend.repository;

import com.attendance.backend.model.CourseEnrollment;
import com.attendance.backend.model.Course;
import com.attendance.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByStudent(User student);

    List<CourseEnrollment> findByCourse(Course course);
}
