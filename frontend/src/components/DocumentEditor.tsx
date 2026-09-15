"use client";
import React, { useState, useEffect } from "react";

interface Clause {
  id: string;
  heading: string;
  content: string;
  sub_clauses?: string[];
}

interface TableData {
  table_title: string;
  headers: string[];
  rows: string[][];
}

interface Section {
  section_id: string;
  title: string;
  executive_summary?: string;
  clauses: Clause[];
  data_tables?: TableData[];
  mandatory_regulatory_verbatim?: string;
}

interface DocumentEditorProps {
  rfpContent: string;
  onChange: (updatedContent: string) => void;
}

export default function DocumentEditor({ rfpContent, onChange }: DocumentEditorProps) {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    try {
      if (rfpContent) {
        const parsed = typeof rfpContent === "string" ? JSON.parse(rfpContent) : rfpContent;
        if (Array.isArray(parsed)) {
          setSections(parsed);
        } else if (parsed && Array.isArray(parsed.rfp)) {
          setSections(parsed.rfp);
        } else if (parsed && Array.isArray(parsed.sections)) {
          setSections(parsed.sections);
        } else {
          setSections([]);
        }
      }
    } catch (e) {
      console.error("Error parsing RFP content in DocumentEditor", e);
    }
  }, [rfpContent]);

  const commitChanges = (newSections: Section[]) => {
    setSections(newSections);
    onChange(JSON.stringify(newSections));
  };

  const updateSection = (sIndex: number, field: keyof Section, value: any) => {
    const newS = [...sections];
    (newS[sIndex] as any)[field] = value;
    commitChanges(newS);
  };

  const updateClause = (sIndex: number, cIndex: number, field: 'heading' | 'content', value: string) => {
    const newS = [...sections];
    newS[sIndex].clauses[cIndex][field] = value;
    commitChanges(newS);
  };

  const EditableSpan = ({ value, onChange: onCh, className }: { value: string, onChange: (v: string) => void, className?: string }) => (
    <span
      contentEditable
      suppressContentEditableWarning
      className={`outline-none hover:bg-[#1a437f]/5 focus:bg-[#1a437f]/8 focus:ring-1 focus:ring-[#1a437f]/20 transition-all rounded-sm px-0.5 -mx-0.5 cursor-text ${className || ''}`}
      onBlur={(e) => onCh(e.currentTarget.innerText)}
    >
      {value}
    </span>
  );

  const EditableDiv = ({ value, onChange: onCh, className }: { value: string, onChange: (v: string) => void, className?: string }) => (
    <div
      contentEditable
      suppressContentEditableWarning
      className={`outline-none hover:bg-[#1a437f]/5 focus:bg-[#1a437f]/8 focus:ring-1 focus:ring-[#1a437f]/20 transition-all rounded-sm px-1 -mx-1 cursor-text ${className || ''}`}
      onBlur={(e) => onCh(e.currentTarget.innerText)}
    >
      {value}
    </div>
  );

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar bg-[#e8ecf1]" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* A4-style paper container floating on grey canvas */}
      <div className="py-8 px-6 min-h-full flex justify-center">
        <div
          className="bg-white w-full max-w-[52rem] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)]"
          style={{ minHeight: 'calc(100vh - 140px)' }}
        >
          {/* Document content area with page-like margins */}
          <div className="px-16 py-14 text-[#2c3e50]" style={{ fontSize: '14px', lineHeight: 1.75 }}>

            {sections?.map((section, sIndex) => (
              <div key={sIndex} className={sIndex > 0 ? 'mt-16 pt-12 border-t border-slate-200' : ''}>

                {/* Section Header */}
                <h1 className="text-[#1a437f] text-[22px] font-bold pb-3 mb-7 mt-0 border-b-[2.5px] border-[#1a437f] uppercase tracking-wide">
                  <span className="text-[#1a437f]/60 mr-1">§{section.section_id}</span>{' '}
                  <EditableSpan value={section.title} onChange={(val) => updateSection(sIndex, 'title', val)} />
                </h1>

                {/* Executive Summary */}
                {section.executive_summary && (
                  <div className="bg-gradient-to-r from-[#f0f3f8] to-[#f8f9fb] border-l-[3px] border-[#1a437f] px-6 py-4 my-6 italic leading-[1.65] text-[13.5px] text-[#3d5a80] rounded-r-lg">
                    <EditableDiv value={section.executive_summary} onChange={(val) => updateSection(sIndex, 'executive_summary', val)} />
                  </div>
                )}

                {/* Clauses */}
                {section.clauses?.map((clause, cIndex) => (
                  <div key={cIndex} className="mb-10 group">
                    <div className="font-semibold text-[15px] text-[#1a437f] mb-2 flex items-baseline gap-2">
                      <span className="text-[#1a437f]/50 text-[13px] font-mono">{clause.id}</span>
                      <EditableSpan value={clause.heading} onChange={(val) => updateClause(sIndex, cIndex, 'heading', val)} />
                    </div>
                    <div className="text-justify text-[13.5px] leading-[1.75] text-[#374151]">
                      <EditableDiv value={clause.content} onChange={(val) => updateClause(sIndex, cIndex, 'content', val)} />
                    </div>

                    {/* Sub Clauses */}
                    {clause.sub_clauses && clause.sub_clauses.length > 0 && (
                      <ul className="ml-6 mt-3 mb-4 space-y-2">
                        {clause.sub_clauses.map((sub, subIdx) => (
                          <li key={subIdx} className="text-[13px] text-[#4b5563] leading-[1.6] flex items-start gap-2">
                            <span className="text-[#1a437f]/40 mt-[2px] select-none">▪</span>
                            <EditableSpan
                              value={sub}
                              onChange={(val) => {
                                const newS = [...sections];
                                newS[sIndex].clauses[cIndex].sub_clauses![subIdx] = val;
                                commitChanges(newS);
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* Tables */}
                {section.data_tables && section.data_tables.map((table, tIndex) => (
                  <div key={tIndex} className="my-8">
                    <div className="font-semibold text-[#1a437f] mb-3 text-[14px] border-l-[3px] border-[#1a437f]/60 pl-3 flex items-center gap-2">
                      <span className="text-[#1a437f]/40 text-[12px]">TABLE {section.section_id}.{tIndex + 1}</span>
                      <span className="text-[#1a437f]/20">|</span>
                      <EditableSpan
                        value={table.table_title}
                        onChange={(val) => {
                          const newS = [...sections];
                          newS[sIndex].data_tables![tIndex].table_title = val;
                          commitChanges(newS);
                        }}
                      />
                    </div>
                    <div className="rounded-lg overflow-hidden border border-[#dee2e6] shadow-sm">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            {table.headers?.map((h, hIdx) => (
                              <th key={hIdx} className="bg-[#1a437f] text-white p-3 text-[11px] font-bold uppercase text-left tracking-wider">
                                <EditableSpan
                                  value={h}
                                  className="text-white hover:!bg-white/10 focus:!bg-white/15 focus:!ring-white/20"
                                  onChange={(val) => {
                                    const newS = [...sections];
                                    newS[sIndex].data_tables![tIndex].headers[hIdx] = val;
                                    commitChanges(newS);
                                  }}
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows?.map((row, rIdx) => (
                            <tr key={rIdx} className="even:bg-[#f8f9fb] hover:bg-[#eef1f6] transition-colors">
                              {row?.map((cell, cellIdx) => (
                                <td key={cellIdx} className="p-3 border-t border-[#e5e7eb] text-[13px] align-top leading-[1.5] text-[#374151]">
                                  <EditableDiv
                                    value={cell}
                                    onChange={(val) => {
                                      const newS = [...sections];
                                      newS[sIndex].data_tables![tIndex].rows[rIdx][cellIdx] = val;
                                      commitChanges(newS);
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {/* Regulatory Verbatim */}
                {section.mandatory_regulatory_verbatim && (
                  <div className="border border-dashed border-[#e74c3c]/40 p-5 mt-10 bg-[#fef2f2] text-[13px] text-[#991b1b] leading-[1.6] rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-[#dc2626]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      Mandatory Regulatory Verbatim
                    </div>
                    <EditableDiv
                      value={section.mandatory_regulatory_verbatim}
                      onChange={(val) => updateSection(sIndex, 'mandatory_regulatory_verbatim', val)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

