package com.attendance.backend.repository;

import com.attendance.backend.model.ClassSession;
import com.attendance.backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByCourse(Course course);
}
