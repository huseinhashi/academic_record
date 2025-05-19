import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Common skills list - you can expand this list
const COMMON_SKILLS = [
  "JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin",
  "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "Spring Boot",
  "HTML", "CSS", "TypeScript", "SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Linux", "Git",
  "Machine Learning", "Data Science", "Artificial Intelligence", "Deep Learning",
  "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator",
  "Project Management", "Agile", "Scrum", "DevOps", "CI/CD",
  "Mobile Development", "iOS", "Android", "React Native", "Flutter",
  "Web Development", "Frontend", "Backend", "Full Stack", "REST API",
  "Testing", "Jest", "Selenium", "Cypress", "Unit Testing",
  "Cybersecurity", "Network Security", "Ethical Hacking", "Penetration Testing",
  "Blockchain", "Web3", "Ethereum",
  "Data Analysis", "Data Visualization", "Business Intelligence", "Tableau", "Power BI",
  "Cloud Computing", "Serverless", "Microservices", "API Gateway", "Lambda",
  "System Design", "Architecture", "Design Patterns", "Clean Code", "SOLID Principles","Others"
];

export const SkillsSelect = ({ 
  selectedSkills = [], 
  onSkillsChange, 
  maxSkills = 5,
  className,
  required = false,
  error
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Filter skills based on search query
  const filteredSkills = COMMON_SKILLS.filter(skill =>
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get skills to display based on showAll state
  const displaySkills = showAll ? filteredSkills : filteredSkills.slice(0, maxSkills);

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.includes(skill)) {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    onSkillsChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <Input
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {/* Selected Skills */}
      <div className="flex flex-wrap gap-2">
        {selectedSkills.map((skill) => (
          <Badge 
            key={skill} 
            variant="secondary" 
            className="flex items-center gap-1"
          >
            {skill}
            <button
              type="button"
              onClick={() => handleSkillRemove(skill)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Skills Dropdown */}
      {isOpen && (
        <div className="border rounded-md p-2 space-y-2 max-h-60 overflow-y-auto">
          {displaySkills.length > 0 ? (
            <>
              {displaySkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillSelect(skill)}
                  disabled={selectedSkills.includes(skill)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-sm text-sm",
                    selectedSkills.includes(skill)
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "hover:bg-muted"
                  )}
                >
                  {skill}
                </button>
              ))}
              
              {filteredSkills.length > maxSkills && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show More
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No skills found
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}; 