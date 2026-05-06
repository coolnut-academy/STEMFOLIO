import React from 'react';
import { Project, User, Advisor } from '@/types';

interface PortfolioHeaderProps {
  project: Project;
  students: User[];
  advisors: Advisor[];
}

export const PortfolioHeader = ({ project, students, advisors }: PortfolioHeaderProps) => {
  return (
    <div className="flex flex-col gap-6 border-b border-gray-200 pb-8 mb-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
          {project.title}
        </h1>
        {project.titleEn && (
          <h2 className="text-xl text-gray-500 font-medium">
            {project.titleEn}
          </h2>
        )}
      </div>

      <div className="flex justify-center gap-3 mt-2">
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100">
          หมวดหมู่: {project.category}
        </span>
        <span className="px-3 py-1 bg-gray-50 text-gray-700 text-sm font-semibold rounded-full border border-gray-200">
          ปีการศึกษา {project.academicYear}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">คณะผู้จัดทำ</h3>
          <ul className="flex flex-col gap-2">
            {students.length > 0 ? students.map(student => (
              <li key={student.id} className="text-gray-800 font-medium flex justify-between">
                <span>{student.name}</span>
                <span className="text-gray-500 ml-4">ห้อง {student.classRoom} เลขที่ {student.studentId}</span>
              </li>
            )) : <li className="text-gray-400 italic">ไม่พบข้อมูลนักเรียน</li>}
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">ครูที่ปรึกษา</h3>
          <ul className="flex flex-col gap-2">
            {advisors.length > 0 ? advisors.map(advisor => (
              <li key={advisor.id} className="text-gray-800 font-medium">
                {advisor.title || ''}{advisor.name}
              </li>
            )) : <li className="text-gray-400 italic">ไม่พบข้อมูลครูที่ปรึกษา</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};
