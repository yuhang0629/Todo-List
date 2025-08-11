import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Calendar, Clock, Pause, Check, X, ChevronDown, ChevronRight, ArrowRight, Pin, PinOff, Palette, AlertTriangle, CalendarDays, Zap, Target, Flag } from 'lucide-react';
import { storage } from './src/storage.js';

const TodoManager = () => {
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedDates, setExpandedDates] = useState(new Set([new Date().toISOString().split('T')[0]]));
  const [isMinimized, setIsMinimized] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingComment, setEditingComment] = useState('');
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [newDeadline, setNewDeadline] = useState('');
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [theme, setTheme] = useState('green');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [newTaskDeadline, setNewTaskDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskPriority, setNewTaskPriority] = useState('green');
  const [completingTasks, setCompletingTasks] = useState(new Set());

  // Close theme picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showThemePicker && !event.target.closest('.theme-picker-container')) {
        setShowThemePicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showThemePicker]);

  // Keyboard shortcuts for priority setting
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setNewTaskPriority('red');
            break;
          case '2':
            event.preventDefault();
            setNewTaskPriority('orange');
            break;
          case '3':
            event.preventDefault();
            setNewTaskPriority('green');
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme configurations
  const themes = useMemo(() => ({
    green: {
      header: 'bg-gradient-to-r from-green-500 to-green-600',
      headerHover: 'hover:bg-green-400',
      accent: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
      focus: 'focus:ring-green-500',
      border: 'focus:border-green-500 hover:border-green-300',
      badge: 'bg-green-100 text-green-600'
    },
    blue: {
      header: 'bg-gradient-to-r from-blue-500 to-blue-600',
      headerHover: 'hover:bg-blue-400',
      accent: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      focus: 'focus:ring-blue-500',
      border: 'focus:border-blue-500 hover:border-blue-300',
      badge: 'bg-blue-100 text-blue-600'
    },
    purple: {
      header: 'bg-gradient-to-r from-purple-500 to-purple-600',
      headerHover: 'hover:bg-purple-400',
      accent: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700',
      focus: 'focus:ring-purple-500',
      border: 'focus:border-purple-500 hover:border-purple-300',
      badge: 'bg-purple-100 text-purple-600'
    },
    dark: {
      header: 'bg-gradient-to-r from-gray-800 to-gray-900',
      headerHover: 'hover:bg-gray-700',
      accent: 'text-gray-800',
      button: 'bg-gray-800 hover:bg-gray-900',
      focus: 'focus:ring-gray-500',
      border: 'focus:border-gray-500 hover:border-gray-300',
      badge: 'bg-gray-100 text-gray-800'
    },
    sunset: {
      header: 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600',
      headerHover: 'hover:bg-orange-400',
      accent: 'text-orange-600',
      button: 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600',
      focus: 'focus:ring-orange-500',
      border: 'focus:border-orange-500 hover:border-orange-300',
      badge: 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700'
    },
    ocean: {
      header: 'bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500',
      headerHover: 'hover:bg-cyan-400',
      accent: 'text-cyan-600',
      button: 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600',
      focus: 'focus:ring-cyan-500',
      border: 'focus:border-cyan-500 hover:border-cyan-300',
      badge: 'bg-gradient-to-r from-blue-100 to-teal-100 text-cyan-700'
    },
    aurora: {
      header: 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-600',
      headerHover: 'hover:bg-blue-400',
      accent: 'text-blue-600',
      button: 'bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600',
      focus: 'focus:ring-blue-500',
      border: 'focus:border-blue-500 hover:border-blue-300',
      badge: 'bg-gradient-to-r from-green-100 to-purple-100 text-blue-700'
    },
    fire: {
      header: 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500',
      headerHover: 'hover:bg-orange-400',
      accent: 'text-red-600',
      button: 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
      focus: 'focus:ring-red-500',
      border: 'focus:border-red-500 hover:border-red-300',
      badge: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700'
    }
  }), []);

  const currentTheme = themes[theme];

  // Load tasks from file system on mount (optimized)
  useEffect(() => {
    let isMounted = true;
    const loadTasks = async () => {
      const loadedTasks = await storage.loadTodos();
      if (isMounted) {
        // Auto-escalate priorities based on deadlines
        const escalatedTasks = escalatePriorities(loadedTasks);
        setTasks(escalatedTasks);
      }
    };
    loadTasks();
    return () => { isMounted = false; };
  }, []);

  // Auto-escalate priorities based on deadlines
  const escalatePriorities = (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const escalatedTasks = { ...tasks };
    let hasChanges = false;

    Object.keys(escalatedTasks).forEach(date => {
      Object.keys(escalatedTasks[date]).forEach(taskId => {
        const task = escalatedTasks[date][taskId];
        if (task.status === 'DONE') return;

        const deadline = task.deadline || task.createdAt;
        const deadlineDate = deadline.split('T')[0];
        
        // Auto-escalate based on deadline proximity
        if (deadlineDate === today && task.priority === 'orange') {
          // Orange becomes red on deadline day
          escalatedTasks[date][taskId].priority = 'red';
          hasChanges = true;
        } else if (deadlineDate === tomorrowStr && task.priority === 'green') {
          // Green becomes orange one day before deadline
          escalatedTasks[date][taskId].priority = 'orange';
          hasChanges = true;
        }
      });
    });

    return escalatedTasks;
  };

  // Check for priority escalations daily
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => escalatePriorities(prev));
    }, 60000 * 60); // Check every hour
    
    return () => clearInterval(interval);
  }, []);


  // Debounced save to prevent excessive file writes
  useEffect(() => {
    if (Object.keys(tasks).length === 0) return;
    
    const timeoutId = setTimeout(() => {
      storage.saveTodos(tasks);
    }, 300); // Save after 300ms of no changes
    
    return () => clearTimeout(timeoutId);
  }, [tasks]);


  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const addTask = () => {
    if (!newTask.trim()) return;
    if (!newTaskDeadline) {
      alert('Please set a deadline for this task');
      return;
    }

    const taskId = Date.now().toString();
    const dateKey = selectedDate;

    setTasks(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [taskId]: {
          id: taskId,
          text: newTask.trim(),
          status: 'TODO',
          comment: '',
          deadline: newTaskDeadline,
          priority: newTaskPriority,
          createdAt: new Date().toISOString()
        }
      }
    }));

    setNewTask('');
    setNewTaskDeadline(new Date().toISOString().split('T')[0]);
    setNewTaskPriority('green');
  };

  const updateTaskStatus = (date, taskId, newStatus) => {
    const task = tasks[date][taskId];
    const wasCompleted = task.status === 'DONE';
    const isCompleting = newStatus === 'DONE' && !wasCompleted;
    
    if (isCompleting) {
      // Trigger completion animation
      setCompletingTasks(prev => new Set(prev).add(taskId));
      
      // Remove animation after delay
      setTimeout(() => {
        setCompletingTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }, 1000);
    }
    
    setTasks(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [taskId]: {
          ...prev[date][taskId],
          status: newStatus
        }
      }
    }));
  };


  const updateTaskPriority = (date, taskId, priority) => {
    setTasks(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [taskId]: {
          ...prev[date][taskId],
          priority: priority
        }
      }
    }));
  };

  const updateTaskComment = (date, taskId, comment) => {
    setTasks(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [taskId]: {
          ...prev[date][taskId],
          comment: comment
        }
      }
    }));
  };

  const updateTaskDeadline = (date, taskId, deadline) => {
    setTasks(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [taskId]: {
          ...prev[date][taskId],
          deadline: deadline
        }
      }
    }));
  };

  const deleteTask = (date, taskId) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      delete newTasks[date][taskId];
      if (Object.keys(newTasks[date]).length === 0) {
        delete newTasks[date];
      }
      return newTasks;
    });
  };

  const moveTaskToToday = (fromDate, taskId) => {
    const task = tasks[fromDate][taskId];
    setTasks(prev => {
      const newTasks = { ...prev };

      // Remove from old date
      delete newTasks[fromDate][taskId];
      if (Object.keys(newTasks[fromDate]).length === 0) {
        delete newTasks[fromDate];
      }

      // Add to today
      if (!newTasks[today]) newTasks[today] = {};
      newTasks[today][taskId] = {
        ...task,
        status: task.status === 'DONE' ? 'TODO' : task.status
      };

      return newTasks;
    });
  };

  const toggleDateExpansion = (date) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };


  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
    // Temporarily disable always-on-top when minimizing to prevent gesture interference
    if (alwaysOnTop) {
      storage.setAlwaysOnTop(false);
    }
    // Don't await - make it non-blocking for faster UI response
    storage.resizeWindow(140, 40);
  }, [alwaysOnTop]);

  const handleExpand = useCallback(() => {
    setIsMinimized(false);
    // Restore always-on-top setting when expanding
    if (alwaysOnTop) {
      storage.setAlwaysOnTop(true);
    }
    // Don't await - make it non-blocking for faster UI response
    storage.resizeWindow(500, 700);
  }, [alwaysOnTop]);

  const toggleAlwaysOnTop = useCallback(() => {
    const newValue = !alwaysOnTop;
    setAlwaysOnTop(newValue);
    // Don't await - make it non-blocking
    storage.setAlwaysOnTop(newValue);
  }, [alwaysOnTop]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'IN_PROGRESS': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'ON_HOLD': return 'bg-orange-100 border-orange-300 text-orange-700';
      case 'DONE': return 'bg-green-100 border-green-300 text-green-700';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'TODO': return <Calendar className="w-3 h-3" />;
      case 'IN_PROGRESS': return <Clock className="w-3 h-3" />;
      case 'ON_HOLD': return <Pause className="w-3 h-3" />;
      case 'DONE': return <Check className="w-3 h-3" />;
      default: return <Calendar className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'red': return 'border-red-500 bg-red-50';
      case 'orange': return 'border-orange-500 bg-orange-50';
      case 'green': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case 'red': return 'border-l-red-500';
      case 'orange': return 'border-l-orange-500';
      case 'green': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'red': return <Zap className="w-3 h-3 text-red-500" />;
      case 'orange': return <Target className="w-3 h-3 text-orange-500" />;
      case 'green': return <Flag className="w-3 h-3 text-green-500" />;
      default: return <Flag className="w-3 h-3 text-gray-500" />;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'red': return 'Urgent';
      case 'orange': return 'Important';
      case 'green': return 'Low Priority';
      default: return 'Normal';
    }
  };

  const getUnfinishedCount = (date, dateTasks) => {
    return Object.values(dateTasks).filter(task =>
      task.status !== 'DONE'
    ).length;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (dateStr === today) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const sortedDates = useMemo(() => 
    Object.keys(tasks).sort((a, b) => new Date(b) - new Date(a)), 
    [tasks]
  );

  const todayTaskCount = useMemo(() => 
    tasks[today] ? getUnfinishedCount(today, tasks[today]) : 0,
    [tasks, today]
  );

  // Check for overdue tasks
  const overdueTasksCount = useMemo(() => {
    let count = 0;
    const today = new Date().toISOString().split('T')[0];
    
    Object.keys(tasks).forEach(date => {
      Object.values(tasks[date]).forEach(task => {
        if (task.status !== 'DONE') {
          const taskDeadline = (task.deadline || task.createdAt).split('T')[0]; // fallback for old tasks
          if (taskDeadline < today) { // Only count if deadline is BEFORE today
            count++;
          }
        }
      });
    });
    return count;
  }, [tasks]);

  // Check if a task is overdue (deadline passed, not including today)
  const isTaskOverdue = (task) => {
    if (task.status === 'DONE') return false;
    const taskDeadline = (task.deadline || task.createdAt).split('T')[0]; // fallback for old tasks
    const today = new Date().toISOString().split('T')[0];
    return taskDeadline < today; // Only true if deadline is BEFORE today
  };

  // Format deadline for display
  const formatDeadline = (task) => {
    const deadline = task.deadline || task.createdAt; // fallback for old tasks
    if (!deadline) return 'No deadline';
    
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  if (isMinimized) {
    return (
      <div 
        className={`${currentTheme.header} text-white hover:shadow-xl transition-all flex items-center justify-center h-screen w-screen`}
        style={{WebkitAppRegion: 'drag'}}
      >
        <div 
          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-all px-2 py-1 rounded"
          onClick={handleExpand}
          style={{WebkitAppRegion: 'no-drag'}}
        >
          <Calendar className="w-4 h-4" />
          <span className="font-medium text-sm">Todo</span>
          {todayTaskCount > 0 && (
            <div className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
              {todayTaskCount}
            </div>
          )}
          {overdueTasksCount > 0 && (
            <div className="bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
              <AlertTriangle className="w-2 h-2" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-white overflow-hidden flex flex-col relative">
      {/* Header */}
      <div className={`${currentTheme.header} text-white p-4`} style={{WebkitAppRegion: 'drag'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="font-semibold">Daily Todo</h2>
          </div>
          <div className="flex items-center gap-1" style={{WebkitAppRegion: 'no-drag'}}>
            <div className="relative theme-picker-container">
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className={`${currentTheme.headerHover} rounded p-1 transition-colors`}
                title="Change theme"
              >
                <Palette className="w-4 h-4" />
              </button>
              {showThemePicker && (
                <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
                  <div className="grid grid-cols-2 gap-1 w-48">
                    <button
                      onClick={() => {
                        setTheme('green');
                        setShowThemePicker(false);
                      }}
                      className={`w-full h-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 border-2 ${theme === 'green' ? 'border-green-800' : 'border-gray-300'} hover:border-green-700 transition-colors flex items-center justify-center text-white text-xs font-medium`}
                    >
                      Green
                    </button>
                    <button
                      onClick={() => {
                        setTheme('blue');
                        setShowThemePicker(false);
                      }}
                      className={`w-full h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 border-2 ${theme === 'blue' ? 'border-blue-800' : 'border-gray-300'} hover:border-blue-700 transition-colors flex items-center justify-center text-white text-xs font-medium`}
                    >
                      Blue
                    </button>
                    <button
                      onClick={() => {
                        setTheme('purple');
                        setShowThemePicker(false);
                      }}
                      className={`w-full h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 border-2 ${theme === 'purple' ? 'border-purple-800' : 'border-gray-300'} hover:border-purple-700 transition-colors flex items-center justify-center text-white text-xs font-medium`}
                    >
                      Purple
                    </button>
                    <button
                      onClick={() => {
                        setTheme('dark');
                        setShowThemePicker(false);
                      }}
                      className={`w-full h-8 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} hover:border-gray-600 transition-colors flex items-center justify-center text-white text-xs font-medium`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => {
                        setTheme('sunset');
                        setShowThemePicker(false);
                      }}
                      className={`w-full h-8 rounded-lg bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 border-2 ${theme === 'sunset' ? 'border-orange-600' : 'border-gray-300'} hover:border-orange-500 transition-colors flex items-center justify-center text-white text-xs font-medium`}
                    >
                      Sunset
                    </button>
                    <button
                      onClick={() => {
                        setTheme('ocean');
                        setShowThemePicker(false);
                      }}
                      className={`w-full h-8 rounded-lg bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 border-2 ${theme === 'ocean' ? 'border-cyan-600' : 'border-gray-300'} hover:border-cyan-500 transition-colors flex items-center justify-center text-white text-xs font-medium`}
                    >
                      Ocean
                    </button>
                    <button
                      onClick={() => {
                        setTheme('aurora');
                        setShowThemePicker(false);
                      }}
                      className={`w-full h-8 rounded-lg bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 border-2 ${theme === 'aurora' ? 'border-blue-600' : 'border-gray-300'} hover:border-blue-500 transition-colors flex items-center justify-center text-white text-xs font-medium`}
                    >
                      Aurora
                    </button>
                    <button
                      onClick={() => {
                        setTheme('fire');
                        setShowThemePicker(false);
                      }}
                      className={`w-full h-8 rounded-lg bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 border-2 ${theme === 'fire' ? 'border-red-600' : 'border-gray-300'} hover:border-red-500 transition-colors flex items-center justify-center text-white text-xs font-medium`}
                    >
                      Fire
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={toggleAlwaysOnTop}
              className={`${currentTheme.headerHover} rounded p-1 transition-colors`}
              title={alwaysOnTop ? "Disable always on top" : "Enable always on top"}
            >
              {alwaysOnTop ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
            <button
              onClick={handleMinimize}
              className={`${currentTheme.headerHover} rounded p-1 transition-colors`}
              title="Minimize"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-white text-opacity-80 text-sm mt-1">{todayFormatted}</p>
      </div>

      {/* Add Task */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="What needs to be done?"
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${currentTheme.border} transition-colors`}
            />
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className={`w-4 h-4 ${currentTheme.accent}`} />
            <input
              type="date"
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              className={`px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none ${currentTheme.focus} transition-colors`}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="text-xs text-gray-600 mb-1">Priority</div>
            <div className="flex gap-2">
              <button
                onClick={() => setNewTaskPriority('red')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${newTaskPriority === 'red' ? 'bg-red-100 border-2 border-red-500 text-red-700' : 'bg-gray-100 border border-gray-300 text-gray-600 hover:bg-red-50'}`}
              >
                🔴 Urgent
              </button>
              <button
                onClick={() => setNewTaskPriority('orange')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${newTaskPriority === 'orange' ? 'bg-orange-100 border-2 border-orange-500 text-orange-700' : 'bg-gray-100 border border-gray-300 text-gray-600 hover:bg-orange-50'}`}
              >
                🟠 Important
              </button>
              <button
                onClick={() => setNewTaskPriority('green')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${newTaskPriority === 'green' ? 'bg-green-100 border-2 border-green-500 text-green-700' : 'bg-gray-100 border border-gray-300 text-gray-600 hover:bg-green-50'}`}
              >
                🟢 Low Priority
              </button>
            </div>
          </div>
          <button
            onClick={addTask}
            disabled={!newTask.trim()}
            className={`${
              newTask.trim() 
                ? currentTheme.button 
                : 'bg-gray-400 cursor-not-allowed'
            } text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 self-end`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add</span>
          </button>
        </div>
      </div>

      {/* Tasks by Date */}
      <div className="overflow-y-auto flex-1">
        {sortedDates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No tasks yet. Add one above!</p>
          </div>
        ) : (
          sortedDates.map(date => {
            const dateTasks = tasks[date];
            const unfinishedCount = getUnfinishedCount(date, dateTasks);
            const isExpanded = expandedDates.has(date);
            const isOverdue = date < today && unfinishedCount > 0;

            return (
              <div key={date} className="border-b border-gray-100">
                {/* Date Header */}
                <div
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isOverdue ? 'bg-red-50' : ''
                  }`}
                  onClick={() => toggleDateExpansion(date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className={`font-medium ${date === today ? 'text-green-600' : 'text-gray-700'}`}>
                        {formatDate(date)}
                      </span>
                      {isOverdue && (
                        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {unfinishedCount} pending
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {Object.keys(dateTasks).length} tasks
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                {isExpanded && (
                  <div className="pb-2">
                    {Object.values(dateTasks)
                      .sort((a, b) => {
                        // Sort by priority first (red=3, orange=2, green=1)
                        const priorityOrder = { red: 3, orange: 2, green: 1 };
                        const aPriority = priorityOrder[a.priority || 'green'];
                        const bPriority = priorityOrder[b.priority || 'green'];
                        
                        if (aPriority !== bPriority) {
                          return bPriority - aPriority; // Higher priority first
                        }
                        
                        // Then sort by deadline (earlier deadlines first)
                        const aDeadline = new Date(a.deadline || a.createdAt);
                        const bDeadline = new Date(b.deadline || b.createdAt);
                        
                        return aDeadline - bDeadline;
                      })
                      .map(task => {
                      const isTaskExpanded = expandedTasks.has(task.id);
                      const isCompleting = completingTasks.has(task.id);
                      return (
                        <div key={task.id} className={`mx-3 mb-3 p-4 ${isTaskOverdue(task) ? 'bg-red-50 border-l-4 border-red-400' : `bg-white border-l-4 ${getPriorityBorderColor(task.priority || 'green')}`} rounded-lg border border-gray-200 hover:shadow-md transition-all hover:border-l-8 ${isCompleting ? 'animate-pulse bg-gradient-to-r from-green-100 to-blue-100 scale-105 shadow-xl' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(task.priority || 'green')} flex-shrink-0`}>
                                  <div className="flex items-center gap-1">
                                    {getPriorityIcon(task.priority || 'green')}
                                    {getPriorityLabel(task.priority || 'green')}
                                  </div>
                                </span>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(task.status)} flex-shrink-0`}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(task.status)}
                                    {task.status.replace('_', ' ')}
                                  </div>
                                </span>
                                <div className={`text-xs flex items-center gap-1 flex-shrink-0 ${
                                  isTaskOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-500'
                                }`}>
                                  <CalendarDays className="w-3 h-3" />
                                  {formatDeadline(task)}
                                  {isTaskOverdue(task) && <AlertTriangle className="w-3 h-3" />}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <p className={`text-sm flex-1 ${
                                  task.status === 'DONE'
                                    ? 'line-through text-gray-500'
                                    : task.status === 'TODO'
                                      ? 'text-gray-900 font-medium'
                                      : 'text-gray-800'
                                }`}>
                                  {task.text}
                                </p>
                                
                                {task.comment && !isTaskExpanded && (
                                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${currentTheme.badge} flex-shrink-0`}>
                                    💭
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                              {date < today && task.status !== 'DONE' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveTaskToToday(date, task.id);
                                  }}
                                  className={`${currentTheme.accent} hover:opacity-80 text-xs px-2 py-1 rounded transition-colors`}
                                  title="Move to today"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}

                              <button
                                onClick={() => toggleTaskExpansion(task.id)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                                title="Show details"
                              >
                                {isTaskExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(date, task.id);
                                }}
                                className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                                title="Delete task"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Task Details */}
                          {isTaskExpanded && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {/* Comment Section */}
                              {editingTask === task.id ? (
                                <div className="mb-3">
                                  <div className="relative">
                                    <textarea
                                      value={editingComment}
                                      onChange={(e) => setEditingComment(e.target.value)}
                                      placeholder="Add a note or comment..."
                                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-h-[80px]"
                                      rows="4"
                                      autoFocus
                                    />
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => {
                                        updateTaskComment(date, task.id, editingComment);
                                        setEditingTask(null);
                                        setEditingComment('');
                                      }}
                                      className={`${currentTheme.button} text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors`}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingTask(null);
                                        setEditingComment('');
                                      }}
                                      className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : task.comment ? (
                                <div
                                  className="text-sm text-gray-700 bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-lg cursor-pointer hover:bg-blue-100 transition-colors mb-3 italic"
                                  onClick={() => {
                                    setEditingTask(task.id);
                                    setEditingComment(task.comment);
                                  }}
                                >
                                  <span className="text-blue-600 text-xs font-medium block mb-1">💭 Note:</span>
                                  {task.comment}
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingTask(task.id);
                                    setEditingComment(task.comment || '');
                                  }}
                                  className={`text-sm text-gray-500 hover:${currentTheme.accent} transition-colors mb-3 block bg-gray-50 hover:${currentTheme.badge} px-3 py-2 rounded-lg border border-dashed border-gray-300 ${currentTheme.border.replace('focus:', 'hover:')} w-full text-left`}
                                >
                                  💭 Add a note...
                                </button>
                              )}

                              {/* Deadline Section */}
                              <div className="mb-3">
                                <div className="text-xs text-gray-600 mb-2">Deadline</div>
                                {editingDeadline === task.id ? (
                                  <div className="flex gap-2">
                                    <input
                                      type="date"
                                      value={newDeadline}
                                      onChange={(e) => setNewDeadline(e.target.value)}
                                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                    />
                                    <button
                                      onClick={() => {
                                        updateTaskDeadline(date, task.id, newDeadline);
                                        setEditingDeadline(null);
                                        setNewDeadline('');
                                      }}
                                      className={`${currentTheme.button} text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors`}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingDeadline(null);
                                        setNewDeadline('');
                                      }}
                                      className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    className="text-sm bg-gray-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-dashed border-gray-300"
                                    onClick={() => {
                                      setEditingDeadline(task.id);
                                      setNewDeadline((task.deadline || task.createdAt).split('T')[0]);
                                    }}
                                  >
                                    📅 {formatDeadline(task)} (click to edit)
                                  </div>
                                )}
                              </div>

                              {/* Priority Buttons */}
                              <div className="mb-3">
                                <div className="text-xs text-gray-600 mb-2">Priority</div>
                                <div className="flex gap-1">
                                  {[{key: 'red', label: '🔴 Urgent'}, {key: 'orange', label: '🟠 Important'}, {key: 'green', label: '🟢 Low Priority'}].map(priority => (
                                    <button
                                      key={priority.key}
                                      onClick={() => updateTaskPriority(date, task.id, priority.key)}
                                      className={`px-2 py-1 rounded text-xs transition-colors ${
                                        (task.priority || 'green') === priority.key
                                          ? getPriorityColor(priority.key)
                                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                      }`}
                                    >
                                      {priority.label}
                                    </button>
                                  ))}
                                </div>
                              </div>


                              {/* Status Buttons */}
                              <div className="mb-3">
                                <div className="text-xs text-gray-600 mb-2">Status</div>
                                <div className="flex gap-1">
                                  {['TODO', 'IN_PROGRESS', 'ON_HOLD', 'DONE'].map(status => (
                                    <button
                                      key={status}
                                      onClick={() => updateTaskStatus(date, task.id, status)}
                                      className={`px-2 py-1 rounded text-xs transition-colors ${
                                        task.status === status
                                          ? getStatusColor(status)
                                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                      }`}
                                    >
                                      {status.replace('_', ' ')}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TodoManager;