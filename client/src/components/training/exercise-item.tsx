import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ExerciseForm } from "./exercise-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Exercise } from "@shared/types";

interface ExerciseItemProps {
  exercise: Exercise;
  onRegister: (exerciseId: number, data: any) => void;
}

export function ExerciseItem({ exercise, onRegister }: ExerciseItemProps) {
  const [showForm, setShowForm] = useState(false);
  
  const handleOpenForm = () => {
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
  };
  
  const handleSubmit = (data: any) => {
    onRegister(exercise.id, data);
    setShowForm(false);
  };
  
  return (
    <>
      <div className="border border-gray-200 rounded-md p-4 hover:border-primary transition duration-200">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">{exercise.name}</h4>
            <p className="text-sm text-neutral-medium mt-1">{exercise.description}</p>
          </div>
          <Badge variant={exercise.category === "Condicionamento" ? "conditioning" : "essential"}>
            {exercise.category}
          </Badge>
        </div>
        <div className="mt-3 text-sm">
          <p>{exercise.instructions}</p>
        </div>
        <div className="mt-3 flex justify-end">
          <Button 
            className="text-sm flex items-center"
            onClick={handleOpenForm}
          >
            <Check className="h-4 w-4 mr-1" />
            Registrar
          </Button>
        </div>
      </div>
      
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Exercício</DialogTitle>
          </DialogHeader>
          <ExerciseForm exercise={exercise} onSubmit={handleSubmit} onCancel={handleCloseForm} />
        </DialogContent>
      </Dialog>
    </>
  );
}
