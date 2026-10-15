import React from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function JobDescription({ onHandleInputChange }: { onHandleInputChange: any }) {   
  return (
    <div className='border rounded-lg p-4 flex flex-col gap-4 bold '>
      <div>
        <label>Job Title</label>
        <Input
          placeholder='Ex. Full Stack Developer'
          onChange={(e) => onHandleInputChange('jobTitle', e.target.value)}
        />
      </div>

      <div> 
        <label>Job Description</label>
        <Textarea
          placeholder='Paste the job description here'
          className='h-48'
          onChange={(e) => onHandleInputChange('jobDescription', e.target.value)}
        />
      </div>
    </div>
  )
}

export default JobDescription