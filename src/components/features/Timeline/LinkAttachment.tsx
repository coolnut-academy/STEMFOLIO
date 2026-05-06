import React, { useState } from 'react';
import { X, Link2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Attachment } from '@/types';

interface LinkAttachmentProps {
  links: Attachment[];
  onAddLink: (link: Attachment) => void;
  onRemoveLink: (index: number) => void;
  type: 'link' | 'video';
}

export const LinkAttachment = ({ links, onAddLink, onRemoveLink, type }: LinkAttachmentProps) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!url) return;
    
    let validUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      validUrl = `https://${url}`;
    }

    onAddLink({
      id: crypto.randomUUID(),
      url: validUrl,
      type,
      name: name || validUrl,
    });
    
    setUrl('');
    setName('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="flex-1 w-full">
          <Input 
            label={type === 'video' ? "URL วิดีโอ (YouTube/Drive)" : "URL เว็บไซต์"}
            placeholder={type === 'video' ? "https://youtube.com/watch?v=..." : "https://example.com"}
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>
        <div className="flex-1 w-full">
          <Input 
            label="ชื่อลิงก์ (ไม่บังคับ)"
            placeholder="ตัวอย่างเช่น เอกสารอ้างอิง"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
        </div>
        <Button type="button" onClick={handleAdd} className="w-full sm:w-auto mt-2 sm:mt-0" disabled={!url}>
          <Plus className="w-4 h-4 mr-1" /> เพิ่ม
        </Button>
      </div>

      {links.length > 0 && (
        <div className="flex flex-col gap-2">
          {links.map((link, idx) => (
            <div key={link.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-md p-2">
              <div className="flex items-center gap-2 truncate">
                <Link2 className={`w-4 h-4 flex-shrink-0 ${type === 'video' ? 'text-red-500' : 'text-blue-500'}`} />
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium text-gray-800 truncate">{link.name}</span>
                  <span className="text-xs text-gray-500 truncate">{link.url}</span>
                </div>
              </div>
              <button type="button" onClick={() => onRemoveLink(idx)} className="p-1 text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
