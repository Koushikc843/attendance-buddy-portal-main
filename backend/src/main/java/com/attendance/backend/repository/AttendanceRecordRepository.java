package com.attendance.backend.repository;

import com.attendance.backend.model.AttendanceRecord;
import com.attendance.backend.model.ClassSession;
import com.attendance.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByStudent(User student);

    List<AttendanceRecord> findBySession(ClassSession session);
}
