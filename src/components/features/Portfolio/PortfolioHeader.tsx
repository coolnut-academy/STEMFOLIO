import React from 'react';
import { Project, User, Advisor } from '@/types';

interface PortfolioHeaderProps {
  project: Project;
  students: User[];
  advisors: Advisor[];
}

export const PortfolioHeader = ({ project, students, advisors }: PortfolioHeaderProps) => {
  return (
    <div className="flex flex-col gap-6 border-b border-[rgba(255,255,255,0.08)] pb-8 mb-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
          {project.title}
        </h1>
        {project.titleEn && (
          <h2 className="text-xl text-white/58 font-medium">
            {project.titleEn}
          </h2>
        )}
      </div>

      <div className="flex justify-center gap-3 mt-2 flex-wrap">
        <span className="px-3 py-1 text-[#c7d2fe] text-sm font-semibold rounded-full border bg-[rgba(99,102,241,0.14)] border-[rgba(99,102,241,0.28)]">
          หมวดหมู่: {project.category}
        </span>
        <span className="px-3 py-1 text-white/65 text-sm font-semibold rounded-full border bg-[rgba(255,255,255,0.07)] border-[rgba(255,255,255,0.12)]">
          ปีการศึกษา {project.academicYear}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <div>
          <h3 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.14em] mb-3">คณะผู้จัดทำ</h3>
          <ul className="flex flex-col gap-2">
            {students.length > 0 ? students.map(student => (
              <li key={student.id} className="text-white/85 font-medium flex justify-between">
                <span>{student.name}</span>
                <span className="text-white/50 ml-4">ห้อง {student.classRoom} เลขที่ {student.studentId}</span>
              </li>
            )) : <li className="text-white/38 italic">ไม่พบข้อมูลนักเรียน</li>}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.14em] mb-3">ครูที่ปรึกษา</h3>
          <ul className="flex flex-col gap-2">
            {advisors.length > 0 ? advisors.map(advisor => (
              <li key={advisor.id} className="text-white/85 font-medium">
                {advisor.title || ''}{advisor.name}
              </li>
            )) : <li className="text-white/38 italic">ไม่พบข้อมูลครูที่ปรึกษา</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};
