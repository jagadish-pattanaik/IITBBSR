import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch
} from '@mui/material';
import { Add, Remove, Save, Close } from '@mui/icons-material';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'boolean', label: 'True/False' },
  { value: 'text', label: 'Text Answer' },
  { value: 'number', label: 'Numeric Answer' }
];

const INITIAL_QUESTION_STATE = {
  text: '',
  type: 'mcq',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ],
  points: 1,
  caseSensitive: false,
  tolerance: 0.01,
  answer: ''
};

const QuestionDialog = ({ open, onClose, onSave, initialData = null }) => {
  const [question, setQuestion] = useState(INITIAL_QUESTION_STATE);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setQuestion(initialData);
      } else {
        setQuestion(INITIAL_QUESTION_STATE);
      }
    }
  }, [open, initialData]);

  const handleClose = () => {
    setQuestion(INITIAL_QUESTION_STATE);
    onClose();
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index].text = value;
    setQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleCorrectAnswer = (index) => {
    const newOptions = question.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleTypeChange = (type) => {
    setQuestion(prev => ({
      ...prev,
      type,
      options: type === 'mcq' ? [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ] : type === 'boolean' ? [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: false }
      ] : [],
      answer: '',
      caseSensitive: false,
      tolerance: 0.01
    }));
  };

  const handleSave = () => {
    if (!question.text || !question.points) {
      alert('Please fill in all required fields');
      return;
    }

    switch (question.type) {
      case 'mcq':
        if (question.options.length !== 4) {
          alert('MCQ questions must have exactly 4 options');
          return;
        }
        if (question.options.some(opt => !opt.text)) {
          alert('Please fill in all options');
          return;
        }
        if (!question.options.some(opt => opt.isCorrect)) {
          alert('Please select a correct answer');
          return;
        }
        break;

      case 'boolean':
        if (!question.options.some(opt => opt.isCorrect)) {
          alert('Please select either True or False as correct');
          return;
        }
        break;

      case 'text':
        if (!question.answer) {
          alert('Please provide the correct text answer');
          return;
        }
        break;

      case 'number':
        if (!question.answer || isNaN(parseFloat(question.answer))) {
          alert('Please provide a valid numeric answer');
          return;
        }
        if (!question.tolerance || question.tolerance <= 0 || question.tolerance > 1) {
          alert('Please provide a valid tolerance value (between 0 and 1)');
          return;
        }
        break;

      default:
        alert('Invalid question type');
        return;
    }

    onSave(question);
    setQuestion(INITIAL_QUESTION_STATE);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      TransitionProps={{
        onExited: () => setQuestion(INITIAL_QUESTION_STATE)
      }}
      PaperProps={{
        sx: {
          minHeight: '40vh',
          maxHeight: '70vh'
        }
      }}
    >
      <DialogTitle>
        {initialData ? 'Edit Question' : 'Add New Question'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Question Text"
            value={question.text}
            onChange={(e) => setQuestion({ ...question, text: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Question Type</InputLabel>
            <Select
              value={question.type}
              label="Question Type"
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {QUESTION_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(question.type === 'mcq' || question.type === 'boolean') && (
            <FormControl component="fieldset">
              <FormLabel component="legend">
                {question.type === 'mcq' ? 'Options (Select one correct answer)' : 'True/False'}
              </FormLabel>
              <RadioGroup>
                {question.options.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                    <Radio
                      checked={option.isCorrect}
                      onChange={() => handleCorrectAnswer(index)}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      disabled={question.type === 'boolean'}
                      required={question.type === 'mcq'}
                    />
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {(question.type === 'text' || question.type === 'number') && (
            <TextField
              fullWidth
              label="Correct Answer"
              value={question.answer || ''}
              type={question.type === 'number' ? 'number' : 'text'}
              onChange={(e) => setQuestion(prev => ({
                ...prev,
                answer: e.target.value
              }))}
              helperText={question.type === 'number' ? 
                "Enter the exact correct number" : 
                "Enter the correct text answer"}
            />
          )}

          {question.type === 'text' && (
            <FormControlLabel
              control={
                <Switch
                  checked={question.caseSensitive}
                  onChange={(e) => setQuestion(prev => ({
                    ...prev,
                    caseSensitive: e.target.checked
                  }))}
                />
              }
              label="Case Sensitive"
            />
          )}

          {question.type === 'number' && (
            <TextField
              label="Tolerance (±)"
              type="number"
              value={question.tolerance}
              onChange={(e) => setQuestion(prev => ({
                ...prev,
                tolerance: parseFloat(e.target.value) || 0
              }))}
              inputProps={{ 
                min: 0.01,
                max: 1,
                step: 0.01
              }}
              helperText="Acceptable difference from correct answer (e.g., 0.01 = ±1%)"
            />
          )}

          <TextField
            type="number"
            label="Points"
            value={question.points}
            onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) || 1 })}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} startIcon={<Close />}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
          {initialData ? 'Update Question' : 'Add Question'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDialog; 