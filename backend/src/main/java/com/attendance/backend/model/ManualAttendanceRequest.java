package com.attendance.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManualAttendanceRequest {
    private Long sessionId;
    private List<StudentAttendance> attendanceList;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendance {
        private Long studentId;
        private String status; // Present, Absent, Late, Excused
    }
}
