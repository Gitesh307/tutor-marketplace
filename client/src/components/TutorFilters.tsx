import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Spanish",
  "French",
  "SAT Prep",
  "ACT Prep",
];

const GRADE_LEVELS = [
  "Elementary (K-5)",
  "Middle School (6-8)",
  "High School (9-12)",
  "College",
  "Adult Education",
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00",
];

export interface TutorFilterState {
  subjects: string[];
  gradeLevels: string[];
  minRate?: number;
  maxRate?: number;
  minRating: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
}

interface TutorFiltersProps {
  filters: TutorFilterState;
  onChange: (filters: TutorFilterState) => void;
  onSearch: () => void;
}

export function TutorFilters({ filters, onChange, onSearch }: TutorFiltersProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>("");

  const addSubject = (subject: string) => {
    if (subject && !filters.subjects.includes(subject)) {
      onChange({
        ...filters,
        subjects: [...filters.subjects, subject],
      });
      setSelectedSubject("");
    }
  };

  const removeSubject = (subject: string) => {
    onChange({
      ...filters,
      subjects: filters.subjects.filter(s => s !== subject),
    });
  };

  const addGradeLevel = (gradeLevel: string) => {
    if (gradeLevel && !filters.gradeLevels.includes(gradeLevel)) {
      onChange({
        ...filters,
        gradeLevels: [...filters.gradeLevels, gradeLevel],
      });
      setSelectedGradeLevel("");
    }
  };

  const removeGradeLevel = (gradeLevel: string) => {
    onChange({
      ...filters,
      gradeLevels: filters.gradeLevels.filter(g => g !== gradeLevel),
    });
  };

  const clearFilters = () => {
    onChange({
      subjects: [],
      gradeLevels: [],
      minRate: undefined,
      maxRate: undefined,
      minRating: 0,
      dayOfWeek: undefined,
      startTime: undefined,
      endTime: undefined,
    });
  };

  const hasActiveFilters = 
    filters.subjects.length > 0 ||
    filters.gradeLevels.length > 0 ||
    filters.minRate !== undefined ||
    filters.maxRate !== undefined ||
    filters.minRating > 0 ||
    filters.dayOfWeek !== undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filter Tutors</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subject Filter */}
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={selectedSubject} onValueChange={addSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select subjects..." />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.filter(s => !filters.subjects.includes(s)).map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.subjects.map(subject => (
                <Badge key={subject} variant="secondary" className="gap-1">
                  {subject}
                  <button
                    onClick={() => removeSubject(subject)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Grade Level Filter */}
        <div className="space-y-2">
          <Label>Grade Level</Label>
          <Select value={selectedGradeLevel} onValueChange={addGradeLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade levels..." />
            </SelectTrigger>
            <SelectContent>
              {GRADE_LEVELS.filter(g => !filters.gradeLevels.includes(g)).map(gradeLevel => (
                <SelectItem key={gradeLevel} value={gradeLevel}>
                  {gradeLevel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.gradeLevels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.gradeLevels.map(gradeLevel => (
                <Badge key={gradeLevel} variant="secondary" className="gap-1">
                  {gradeLevel}
                  <button
                    onClick={() => removeGradeLevel(gradeLevel)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Hourly Rate Filter */}
        <div className="space-y-3">
          <Label>Hourly Rate ($/hour)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-sm font-normal">Min Rate</Label>
              <input
                type="number"
                min="0"
                step="5"
                value={filters.minRate ?? ""}
                onChange={(e) => onChange({ 
                  ...filters, 
                  minRate: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="Min"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal">Max Rate</Label>
              <input
                type="number"
                min="0"
                step="5"
                value={filters.maxRate ?? ""}
                onChange={(e) => onChange({ 
                  ...filters, 
                  maxRate: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="Max"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Minimum Rating</Label>
            <span className="text-sm font-medium">
              {filters.minRating > 0 ? `${filters.minRating}+ ⭐` : "Any"}
            </span>
          </div>
          <Slider
            value={[filters.minRating]}
            onValueChange={([value]) => onChange({ ...filters, minRating: value })}
            min={0}
            max={5}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Availability Filter */}
        <div className="space-y-3">
          <Label>Availability</Label>
          
          <div className="space-y-2">
            <Label className="text-sm font-normal">Day of Week</Label>
            <Select
              value={filters.dayOfWeek?.toString()}
              onValueChange={(value) => 
                onChange({ 
                  ...filters, 
                  dayOfWeek: value ? parseInt(value) : undefined 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map(day => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filters.dayOfWeek !== undefined && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm font-normal">Start Time</Label>
                  <Select
                    value={filters.startTime || ""}
                    onValueChange={(value) => 
                      onChange({ ...filters, startTime: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Start" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-normal">End Time</Label>
                  <Select
                    value={filters.endTime || ""}
                    onValueChange={(value) => 
                      onChange({ ...filters, endTime: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="End" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>

        <Button onClick={onSearch} className="w-full">
          Search Tutors
        </Button>
      </CardContent>
    </Card>
  );
}
