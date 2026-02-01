import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, X } from "lucide-react";

interface DateRangeSelectorProps {
  onDateRangeChange: (startDate: string | undefined, endDate: string | undefined) => void;
}

export function DateRangeSelector({ onDateRangeChange }: DateRangeSelectorProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleApply = () => {
    // Validation
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        setError("End date must be after start date");
        return;
      }
    }

    setError("");
    onDateRangeChange(
      startDate || undefined,
      endDate || undefined
    );
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setError("");
    onDateRangeChange(undefined, undefined);
  };

  const handlePreset = (days: number | "all") => {
    const end = new Date();
    const endStr = end.toISOString().split('T')[0];
    
    if (days === "all") {
      setStartDate("");
      setEndDate("");
      setError("");
      onDateRangeChange(undefined, undefined);
      return;
    }
    
    const start = new Date();
    start.setDate(start.getDate() - days);
    const startStr = start.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    setError("");
    onDateRangeChange(startStr, endStr);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Date Range
        </CardTitle>
        <CardDescription>
          Filter analytics data by custom date range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError("");
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError("");
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleApply} size="sm">
              Apply Range
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Preset Buttons */}
          <div>
            <p className="text-sm font-medium mb-2">Quick Select:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handlePreset(7)}
                variant="outline"
                size="sm"
              >
                Last 7 Days
              </Button>
              <Button
                onClick={() => handlePreset(30)}
                variant="outline"
                size="sm"
              >
                Last 30 Days
              </Button>
              <Button
                onClick={() => handlePreset(90)}
                variant="outline"
                size="sm"
              >
                Last 3 Months
              </Button>
              <Button
                onClick={() => handlePreset(180)}
                variant="outline"
                size="sm"
              >
                Last 6 Months
              </Button>
              <Button
                onClick={() => handlePreset(365)}
                variant="outline"
                size="sm"
              >
                Last Year
              </Button>
              <Button
                onClick={() => handlePreset("all")}
                variant="outline"
                size="sm"
              >
                All Time
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
