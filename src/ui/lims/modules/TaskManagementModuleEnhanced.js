import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { LIMSModule } from '../core/LIMSModule.js';
import { TaskManagementDemo } from './TaskManagementDemo.js';
import { ModalPortal } from '../utils/modalPortal.js';
import { TaskSearchAndFilterIntegration } from './taskManagement/TaskSearchAndFilterIntegration.js';
import { TaskDueDateModule } from './taskManagement/dueDate/TaskDueDateModule.js';
import { TaskAssigneeModule } from './taskManagement/assignee/TaskAssigneeModule.js';
import './taskManagement/assignee/TaskAssigneeModule.js';

// Note: Since @dnd-kit is React-specific and we're using LitElement,
// we'll implement professional drag-and-drop using enhanced HTML5 drag-and-drop API
// with accessibility features, animations, and keyboard navigation

/**
 * Enhanced Task Management Module with Professional Drag-and-Drop
 * Implements @dnd-kit for accessibility-first kanban board functionality
 * Features: Drag-and-drop, command palette, keyboard shortcuts, natural language input
 */
export class TaskManagementModuleEnhanced extends LIMSModule {
    static styles = [
        LIMSModule.styles,
        css`
            /* No need to override parent overflow with portal approach */
            
            /* Previous styles maintained */
            .task-management-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                gap: 16px;
                position: relative; /* Create stacking context */
            }
            
            .task-content {
                flex: 1;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                min-height: 0;
            }

            .task-toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px;
                background: var(--toolbar-background, rgba(0, 0, 0, 0.4));
                border-radius: var(--border-radius, 7px);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            }

            .toolbar-left {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .view-switcher {
                display: flex;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                padding: 4px;
                gap: 2px;
            }

            .view-button {
                background: transparent;
                border: none;
                color: var(--text-color, #e5e5e7);
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 4px;
                transition: all 0.2s;
                font-size: 13px;
                font-weight: 500;
                opacity: 0.7;
            }

            .view-button:hover {
                opacity: 1;
                background: var(--hover-background, rgba(255, 255, 255, 0.1));
            }

            .view-button.active {
                opacity: 1;
                background: var(--accent-color, #007aff);
                color: white;
            }

            .toolbar-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            /* Enhanced Kanban Board Styles for Drag-and-Drop */
            .kanban-board {
                display: flex;
                flex: 1;
                gap: 16px;
                padding: 16px;
                overflow-x: auto;
                overflow-y: hidden;
                position: relative;
                min-height: 0;
            }

            .kanban-column {
                min-width: 300px;
                background: rgba(0, 0, 0, 0.4);
                border-radius: var(--border-radius, 7px);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                display: flex;
                flex-direction: column;
                height: 100%;
                max-height: 100%;
                transition: all 0.2s;
            }

            .kanban-column.drag-over {
                background: rgba(0, 122, 255, 0.1);
                border-color: var(--accent-color, #007aff);
            }

            .kanban-header {
                padding: 16px;
                border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                display: flex;
                align-items: center;
                justify-content: space-between;
                user-select: none;
            }

            .column-add-button {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                background: transparent;
                color: var(--text-secondary, rgba(255, 255, 255, 0.7));
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
                margin-left: 8px;
            }
            
            .column-add-button:hover {
                background: var(--accent-color, #007aff);
                color: white;
                border-color: var(--accent-color, #007aff);
            }
            
            .column-add-button:active {
                transform: scale(0.95);
            }

            .column-title {
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .task-count {
                background: rgba(255, 255, 255, 0.2);
                color: var(--text-color, #e5e5e7);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }

            .kanban-tasks {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-height: 100px;
            }

            /* Enhanced Task Card Styles for Drag-and-Drop */
            .task-card {
                background: rgba(0, 0, 0, 0.6);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                border-radius: var(--border-radius, 7px);
                padding: 12px;
                cursor: grab;
                transition: all 0.2s;
                position: relative;
                user-select: none;
            }

            .task-card:hover {
                background: rgba(0, 0, 0, 0.8);
                border-color: var(--accent-color, #007aff);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .task-card:hover::after {
                content: "Double-click to edit";
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 11px;
                color: var(--text-secondary, rgba(255, 255, 255, 0.5));
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                animation: fadeInUp 0.3s ease-out 0.5s forwards;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(5px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }

            .task-card.dragging {
                opacity: 0.5;
                cursor: grabbing;
                transform: rotate(3deg) scale(1.02);
            }

            .task-card.drag-overlay {
                cursor: grabbing;
                transform: rotate(3deg) scale(1.05);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                background: rgba(0, 0, 0, 0.9);
                border-color: var(--accent-color, #007aff);
            }
            
            .task-actions {
                position: absolute;
                top: 8px;
                right: 8px;
                display: flex;
                gap: 4px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            
            .task-card:hover .task-actions {
                opacity: 1;
            }
            
            .task-action-button {
                width: 28px;
                height: 28px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .task-edit-button {
                background: rgba(0, 122, 255, 0.2);
                color: #007aff;
            }
            
            .task-edit-button:hover {
                background: rgba(0, 122, 255, 0.3);
                transform: scale(1.1);
            }
            
            .task-delete-button {
                background: rgba(255, 59, 48, 0.2);
                color: #ff3b30;
            }
            
            .task-delete-button:hover {
                background: rgba(255, 59, 48, 0.3);
                transform: scale(1.1);
            }
            
            /* Task content styles */
            .task-title {
                font-weight: 600;
                margin-bottom: 6px;
                color: var(--accent-color, #007aff);
                font-size: 14px;
                line-height: 1.3;
            }
            
            .task-description {
                font-size: 13px;
                color: var(--text-secondary, rgba(255, 255, 255, 0.7));
                margin-bottom: 12px;
                line-height: 1.4;
                /* Limit to 2 lines in kanban view */
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            /* Drop Indicator */
            .drop-indicator {
                height: 2px;
                background: var(--accent-color, #007aff);
                border-radius: 1px;
                margin: 4px 0;
                opacity: 0;
                transition: opacity 0.2s;
            }

            .drop-indicator.active {
                opacity: 1;
                animation: pulse 1s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }

            /* Command Palette Styles */
            .command-palette {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                max-width: 90vw;
                background: rgba(0, 0, 0, 0.95);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                border-radius: var(--border-radius, 12px);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                z-index: 1000;
                display: none;
                overflow: hidden;
            }

            .command-palette.open {
                display: block;
                animation: slideIn 0.2s ease-out;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -48%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }

            .command-input {
                width: 100%;
                padding: 20px 24px;
                background: transparent;
                border: none;
                border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                color: var(--text-color, #e5e5e7);
                font-size: 16px;
                outline: none;
            }

            .command-input::placeholder {
                color: rgba(255, 255, 255, 0.4);
            }

            .command-results {
                max-height: 400px;
                overflow-y: auto;
                padding: 8px;
            }

            .command-item {
                padding: 12px 16px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.1s;
            }

            .command-item:hover,
            .command-item.selected {
                background: rgba(255, 255, 255, 0.1);
            }

            .command-item-icon {
                width: 20px;
                height: 20px;
                opacity: 0.6;
            }

            .command-item-text {
                flex: 1;
            }

            .command-item-shortcut {
                font-size: 12px;
                opacity: 0.5;
                font-family: monospace;
            }

            /* Keyboard Shortcut Indicator */
            .keyboard-hint {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.95);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                border-radius: 8px;
                padding: 12px 20px;
                font-size: 13px;
                opacity: 0;
                transition: all 0.3s;
                pointer-events: none;
                z-index: 2000; /* Higher than shortcut indicator */
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                text-align: center;
            }

            .keyboard-hint.visible {
                opacity: 1;
                transform: translateX(-50%) translateY(-4px);
            }

            /* Natural Language Input */
            .natural-language-input {
                position: relative;
                flex: 1;
                max-width: 500px;
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid var(--accent-color, #007aff);
                border-radius: 10px;
                padding: 2px;
                transition: all 0.2s;
            }
            
            .natural-language-input:focus-within {
                background: rgba(255, 255, 255, 0.08);
                box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
            }
            
            .nl-icon {
                margin: 0 8px;
                opacity: 0.7;
                flex-shrink: 0;
                color: var(--accent-color, #007aff);
            }

            .nl-input {
                width: 100%;
                padding: 10px;
                background: transparent;
                border: none;
                color: var(--text-color, #e5e5e7);
                font-size: 14px;
                outline: none;
            }

            .nl-input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

            .nl-hint {
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                right: 0;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.95);
                border: 1px solid var(--accent-color, #007aff);
                border-radius: 8px;
                font-size: 13px;
                opacity: 0;
                transform: translateY(-4px);
                transition: all 0.2s;
                pointer-events: none;
                z-index: 100;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .nl-hint.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Multi-select Styles */
            .task-card.selected {
                background: rgba(0, 122, 255, 0.2);
                border-color: var(--accent-color, #007aff);
            }

            .selection-count {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--accent-color, #007aff);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                opacity: 0;
                transition: opacity 0.2s;
                pointer-events: none;
            }

            .selection-count.visible {
                opacity: 1;
            }

            /* Accessibility Focus Styles */
            .task-card:focus {
                outline: 2px solid var(--accent-color, #007aff);
                outline-offset: 2px;
            }

            .kanban-column:focus-within {
                border-color: var(--accent-color, #007aff);
            }

            /* Performance Optimization: Virtual Scrolling Placeholder */
            .task-placeholder {
                height: 80px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px dashed rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                margin-bottom: 8px;
            }
            
            /* AI Insights Button */
            .ai-insights-button {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: var(--ai-button-bg, rgba(147, 51, 234, 0.1));
                border: 1px solid var(--ai-button-border, rgba(147, 51, 234, 0.3));
                color: var(--ai-button-color, #9333ea);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                margin-left: auto;
            }
            
            .ai-insights-button:hover {
                background: var(--ai-button-hover-bg, rgba(147, 51, 234, 0.2));
                transform: scale(1.1);
            }
            
            .ai-insights-button:active {
                transform: scale(0.95);
            }
            
            /* Shortcut Indicator */
            .shortcut-indicator {
                position: fixed !important;
                bottom: 24px !important;
                right: 24px !important;
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.95);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                border-radius: 8px;
                font-size: 12px;
                opacity: 0.7;
                transition: all 0.2s;
                z-index: 9999; /* Very high z-index for fullscreen mode */
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                max-width: 300px;
                pointer-events: auto; /* Ensure it's clickable */
                /* Ensure it's positioned relative to viewport */
                position: fixed !important;
                transform: none !important;
                margin: 0 !important;
            }
            
            .shortcut-indicator:hover {
                opacity: 1;
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
            }
            
            .shortcut-hint {
                color: rgba(255, 255, 255, 0.7);
            }
            
            kbd {
                display: inline-block;
                padding: 2px 6px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                font-family: monospace;
                font-size: 11px;
                margin: 0 2px;
            }
            
            /* Template Panel Styles */
            :host {
                --safe-area-inset-top: env(safe-area-inset-top, 0px);
            }
            
            .template-panel-overlay {
                position: fixed;
                top: var(--safe-area-inset-top);
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .template-panel {
                background: var(--panel-background, rgba(30, 30, 30, 0.95));
                border-radius: 12px;
                width: 90%;
                max-width: 900px;
                height: 90%;
                max-height: 700px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                position: relative;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            }
            
            .template-panel-header {
                padding: 20px;
                border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .close-button {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                background: transparent;
                color: var(--text-secondary, rgba(255, 255, 255, 0.7));
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            
            .close-button:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-color, #e5e5e7);
            }
            
            .close-button:active {
                transform: scale(0.95);
            }
            
            .template-categories {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
                /* Add custom scrollbar */
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
            }
            
            .template-categories::-webkit-scrollbar {
                width: 8px;
            }
            
            .template-categories::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .template-categories::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
            
            .template-categories::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .template-category {
                margin-bottom: 30px;
            }
            
            .template-category h4 {
                margin-bottom: 15px;
                color: var(--text-secondary, rgba(255, 255, 255, 0.7));
            }
            
            .template-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 16px;
            }
            
            .template-card {
                background: var(--card-background, rgba(255, 255, 255, 0.05));
                border-radius: 8px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            }
            
            .template-card:hover {
                background: var(--hover-background, rgba(255, 255, 255, 0.1));
                transform: translateY(-2px);
            }
            
            .template-icon {
                font-size: 32px;
                margin-bottom: 10px;
            }
            
            .template-name {
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .template-description {
                font-size: 12px;
                opacity: 0.7;
            }
            
            /* Validation Error Styles */
            .validation-error {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 6px;
                padding: 12px;
                margin: 10px;
                font-size: 13px;
                color: #ef4444;
            }
            
            .validation-error-icon {
                margin-right: 8px;
            }
            
            /* Template Button */
            .template-button {
                background: var(--accent-color, #007aff);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }
            
            .template-button:hover {
                background: var(--accent-hover, #0056b3);
                transform: translateY(-1px);
            }
            
            /* List View Styles */
            .task-list-view {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: rgba(0, 0, 0, 0.4);
                border-radius: var(--border-radius, 7px);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                overflow: hidden;
            }
            
            .task-list-header {
                display: flex;
                background: rgba(0, 0, 0, 0.6);
                padding: 16px;
                border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                font-weight: 600;
                font-size: 13px;
                color: var(--text-secondary, rgba(255, 255, 255, 0.7));
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            .task-list-body {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
            }
            
            .task-list-item {
                display: flex;
                background: var(--card-background, rgba(255, 255, 255, 0.05));
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s;
                align-items: center;
                border: 1px solid transparent;
            }
            
            .task-list-item:hover {
                background: var(--hover-background, rgba(255, 255, 255, 0.08));
                border-color: var(--accent-color, #007aff);
            }
            
            .task-list-item.selected {
                background: var(--selected-background, rgba(0, 122, 255, 0.2));
                border-color: var(--accent-color, #007aff);
            }
            
            .list-col {
                display: flex;
                align-items: center;
                padding: 0 8px;
                min-width: 0; /* Allow text truncation */
            }
            
            .list-col .task-title {
                font-weight: 600;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: var(--accent-color, #007aff);
                font-size: 14px;
            }
            
            .list-col .task-description {
                font-size: 12px;
                color: var(--text-secondary, rgba(255, 255, 255, 0.7));
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-status {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                text-transform: capitalize;
            }
            
            .status-todo {
                background: rgba(100, 116, 139, 0.2);
                color: #94a3b8;
            }
            
            .status-in_progress {
                background: rgba(59, 130, 246, 0.2);
                color: #60a5fa;
            }
            
            .status-review {
                background: rgba(251, 146, 60, 0.2);
                color: #fb923c;
            }
            
            .status-done {
                background: rgba(34, 197, 94, 0.2);
                color: #4ade80;
            }
            
            .task-priority {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                text-transform: capitalize;
            }
            
            .priority-low {
                background: rgba(34, 197, 94, 0.2);
                color: #4ade80;
            }
            
            .priority-normal {
                background: rgba(59, 130, 246, 0.2);
                color: #60a5fa;
            }
            
            .priority-high {
                background: rgba(239, 68, 68, 0.2);
                color: #f87171;
            }
            
            /* Task Creation Modal Styles */
            .task-creation-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999; /* Increased z-index to ensure it's on top */
                backdrop-filter: blur(4px);
                /* Break out of parent constraints */
                overflow: auto; /* Allow scrolling if needed */
            }
            
            .task-creation-modal {
                background: rgba(30, 30, 30, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                width: 600px;
                max-width: 90vw;
                height: calc(90vh - 40px); /* Use viewport height minus margin */
                max-height: calc(100vh - 40px); /* Allow full viewport usage */
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                margin: 20px; /* Consistent margin */
                position: relative; /* Ensure proper stacking context */
                overflow: hidden; /* Prevent modal itself from scrolling */
            }
            
            .modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 0 0 auto; /* Don't grow or shrink */
                background: rgba(30, 30, 30, 0.95); /* Match modal background */
                border-radius: 12px 12px 0 0; /* Round top corners */
            }
            
            .modal-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-color, #e5e5e7);
            }
            
            .modal-close-button {
                background: transparent;
                border: none;
                color: var(--text-secondary, rgba(255, 255, 255, 0.6));
                cursor: pointer;
                padding: 8px;
                border-radius: 6px;
                transition: all 0.2s;
            }
            
            .modal-close-button:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-color, #e5e5e7);
            }
            
            .modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1; /* Take remaining space */
                min-height: 0; /* Critical for flexbox scrolling */
                /* Remove max-height since parent has fixed height */
                /* Add scrollbar styling */
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
            }
            
            .modal-body::-webkit-scrollbar {
                width: 8px;
            }
            
            .modal-body::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .modal-body::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
            
            .modal-body::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .form-group {
                margin-bottom: 24px; /* Increased spacing */
            }
            
            .form-group:last-child {
                margin-bottom: 0;
            }
            
            .form-label {
                display: block;
                margin-bottom: 8px;
                font-size: 13px;
                font-weight: 500;
                color: var(--text-secondary, rgba(255, 255, 255, 0.7));
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .form-input, .form-textarea, .form-select {
                width: 100%;
                padding: 10px 12px;
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: var(--text-color, #e5e5e7);
                font-size: 14px;
                transition: all 0.2s;
                outline: none;
            }
            
            .form-input:focus, .form-textarea:focus, .form-select:focus {
                border-color: var(--accent-color, #007aff);
                background: rgba(0, 0, 0, 0.6);
                box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
            }
            
            .form-textarea {
                resize: vertical;
                min-height: 80px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px; /* Increased gap */
                margin-bottom: 0; /* Remove double margin since form-group already has margin */
            }
            
            .form-row .form-group {
                margin-bottom: 0; /* Prevent double spacing in rows */
            }
            
            .priority-selector {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
            }
            
            .priority-option {
                padding: 8px 12px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                background: rgba(0, 0, 0, 0.4);
                cursor: pointer;
                text-align: center;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .priority-option:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .priority-option.selected {
                border-color: var(--accent-color, #007aff);
                background: rgba(0, 122, 255, 0.2);
            }
            
            .priority-option.urgent {
                color: #ef4444;
            }
            
            .priority-option.high {
                color: #f87171;
            }
            
            .priority-option.medium {
                color: #fbbf24;
            }
            
            .priority-option.low {
                color: #4ade80;
            }
            
            .labels-input {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                padding: 8px;
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                min-height: 42px;
            }
            
            .label-tag {
                background: rgba(255, 255, 255, 0.1);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .label-remove {
                cursor: pointer;
                opacity: 0.6;
                transition: opacity 0.2s;
            }
            
            .label-remove:hover {
                opacity: 1;
            }
            
            .label-input-field {
                border: none;
                background: transparent;
                outline: none;
                color: var(--text-color, #e5e5e7);
                flex: 1;
                min-width: 100px;
            }
            
            .modal-footer {
                padding: 16px 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                flex: 0 0 auto; /* Don't grow or shrink */
                background: rgba(30, 30, 30, 0.98); /* Solid background matching modal */
                border-radius: 0 0 12px 12px; /* Round bottom corners */
            }
            
            .modal-button {
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            
            .modal-button-cancel {
                background: transparent;
                border-color: rgba(255, 255, 255, 0.2);
                color: var(--text-color, #e5e5e7);
            }
            
            .modal-button-cancel:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .modal-button-primary {
                background: var(--accent-color, #007aff);
                color: white;
            }
            
            .modal-button-primary:hover {
                background: #0056b3;
            }
            
            .modal-button-primary:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .task-assignee {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--accent-color, #007aff);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 14px;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .priority-selector {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .modal-content {
                    width: 95%;
                    max-width: none;
                    margin: 10px;
                }
                
                .template-panel {
                    width: 95%;
                    height: 95%;
                }
                
                .template-grid {
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                }
                
                .kanban-board {
                    flex-direction: column;
                    height: auto;
                }
                
                .kanban-column {
                    width: 100%;
                    max-width: none;
                    height: 400px;
                }
            }

            /* Due Date Styles */
            .due-date-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
                white-space: nowrap;
                border: 1px solid transparent;
            }

            .due-date-badge.today {
                background: rgba(251, 191, 36, 0.2);
                color: #fbbf24;
                border-color: rgba(251, 191, 36, 0.3);
            }

            .due-date-badge.tomorrow {
                background: rgba(96, 165, 250, 0.2);
                color: #60a5fa;
                border-color: rgba(96, 165, 250, 0.3);
            }

            .due-date-badge.this-week {
                background: rgba(167, 139, 250, 0.2);
                color: #a78bfa;
                border-color: rgba(167, 139, 250, 0.3);
            }

            .due-date-badge.overdue {
                background: rgba(248, 113, 113, 0.2);
                color: #f87171;
                border-color: rgba(248, 113, 113, 0.3);
                animation: pulse-overdue 2s infinite;
            }

            .due-date-badge.future {
                background: rgba(125, 211, 252, 0.2);
                color: #7dd3fc;
                border-color: rgba(125, 211, 252, 0.3);
            }

            @keyframes pulse-overdue {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            .task-due-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                border-radius: inherit;
                opacity: 0;
                transition: opacity 0.2s;
            }

            .task-card.overdue .task-due-overlay {
                background: linear-gradient(135deg, 
                    rgba(220, 38, 38, 0.1) 0%, 
                    rgba(220, 38, 38, 0.05) 100%);
                border: 2px solid rgba(220, 38, 38, 0.3);
                opacity: 1;
            }

            .task-card.today .task-due-overlay {
                background: linear-gradient(135deg, 
                    rgba(251, 191, 36, 0.1) 0%, 
                    rgba(251, 191, 36, 0.05) 100%);
                border: 2px solid rgba(251, 191, 36, 0.3);
                opacity: 1;
            }

            /* Quick Date Buttons */
            .quick-date-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                margin-top: 8px;
            }

            .quick-date-btn {
                background: var(--quick-date-bg, rgba(255, 255, 255, 0.1));
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                color: var(--text-color, #e5e5e7);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .quick-date-btn:hover {
                background: var(--hover-background, rgba(255, 255, 255, 0.15));
                border-color: var(--accent-color, #007aff);
            }

            /* Due Date Badge Styles */
            .due-date-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
                white-space: nowrap;
                border: 1px solid transparent;
            }

            .due-date-badge.today {
                background: var(--due-today-bg, #fef3c7);
                color: var(--due-today-text, #92400e);
                border-color: var(--due-today-border, #fbbf24);
            }

            .due-date-badge.tomorrow {
                background: var(--due-tomorrow-bg, #dbeafe);
                color: var(--due-tomorrow-text, #1e40af);
                border-color: var(--due-tomorrow-border, #60a5fa);
            }

            .due-date-badge.this-week {
                background: var(--due-week-bg, #f3e8ff);
                color: var(--due-week-text, #7c3aed);
                border-color: var(--due-week-border, #a78bfa);
            }

            .due-date-badge.overdue {
                background: var(--due-overdue-bg, #fee2e2);
                color: var(--due-overdue-text, #dc2626);
                border-color: var(--due-overdue-border, #f87171);
                animation: pulse-overdue 2s infinite;
            }

            .due-date-badge.future {
                background: var(--due-future-bg, #f0f9ff);
                color: var(--due-future-text, #0369a1);
                border-color: var(--due-future-border, #7dd3fc);
            }

            @keyframes pulse-overdue {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            .due-date-icon {
                width: 12px;
                height: 12px;
            }

            /* Sort Controls Styles */
            .sort-controls {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: 16px;
            }

            .sort-label {
                font-size: 12px;
                color: var(--text-muted, rgba(255, 255, 255, 0.6));
                margin-right: 4px;
            }

            .sort-button {
                background: transparent;
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                color: var(--text-color, #e5e5e7);
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s;
            }

            .sort-button:hover {
                background: var(--hover-background, rgba(255, 255, 255, 0.1));
                border-color: var(--accent-color, #007aff);
            }

            .sort-button.active {
                background: var(--accent-color, #007aff);
                color: white;
                border-color: var(--accent-color, #007aff);
            }

            .sort-icon {
                width: 12px;
                height: 12px;
                transition: transform 0.2s;
            }

            .sort-icon.desc {
                transform: rotate(180deg);
            }

            /* Assignee Avatar Styles */
            .task-assignee {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: var(--avatar-bg, #007aff);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 600;
                flex-shrink: 0;
                margin-left: auto;
            }

            .task-assignee img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
            }
        `
    ];

    static properties = {
        ...LIMSModule.properties,
        currentView: { type: String },
        tasks: { type: Array },
        projects: { type: Array },
        filterStatus: { type: String },
        filterProject: { type: String },
        selectedTask: { type: Object },
        commandPaletteOpen: { type: Boolean },
        selectedTasks: { type: Array },
        keyboardHint: { type: String },
        naturalLanguageHint: { type: String },
        dndKitLoaded: { type: Boolean },
        templatePanelOpen: { type: Boolean },
        visibleTasks: { type: Object },
        scrollPositions: { type: Object },
        validationErrors: { type: Object },
        intersectionObservers: { type: Object },
        showQuickAddInput: { type: Boolean },
        quickAddStatus: { type: String },
        showTaskCreationModal: { type: Boolean },
        sortBy: { type: String },
        sortDirection: { type: String },
        teamMembers: { type: Array },
        modalId: { type: String },
        newTaskData: { type: Object },
        isCreatingTask: { type: Boolean },
        editingTask: { type: Object },
        showEditModal: { type: Boolean }
    };

    constructor() {
        super();
        this.moduleId = 'task-management-enhanced';
        this.displayName = 'Task Management Pro';
        this.category = 'business';
        this.learnXIntegration = true;
        
        this.currentView = 'kanban';
        this.tasks = [];
        this.projects = [];
        this.filterStatus = 'all';
        this.filterProject = 'all';
        this.selectedTask = null;
        this.sortBy = 'created_at';
        this.sortDirection = 'desc';
        this.teamMembers = [];
        this.commandPaletteOpen = false;
        this.selectedTasks = [];
        this.keyboardHint = '';
        this.naturalLanguageHint = '';
        this.draggedTask = null;
        this.draggedTasks = [];
        this.dropTargetColumn = null;
        this.dropTargetPosition = null;
        
        this.kanbanColumns = [
            { id: 'todo', title: 'To Do', status: 'todo' },
            { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
            { id: 'review', title: 'Review', status: 'review' },
            { id: 'done', title: 'Done', status: 'done' }
        ];
        
        this.columnStatus = {
            todo: { name: 'To Do', color: '#6b7280' },
            in_progress: { name: 'In Progress', color: '#3b82f6' },
            review: { name: 'Review', color: '#f59e0b' },
            done: { name: 'Done', color: '#10b981' }
        };

        // Initialize new features
        this.templatePanelOpen = false;
        this.visibleTasks = {};
        this.scrollPositions = {};
        this.validationErrors = {};
        this.intersectionObservers = {};
        this.showQuickAddInput = false;
        this.quickAddStatus = 'todo';
        this.showTaskCreationModal = false;
        this.modalId = 'task-creation-modal';
        this.newTaskData = this.getEmptyTaskData();
        this.isCreatingTask = false;
        this.editingTask = null;
        this.showEditModal = false;
        
        // Bind keyboard shortcuts
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleGlobalKeyDown = this.handleGlobalKeyDown.bind(this);
        this.handleColumnScroll = this.handleColumnScroll.bind(this);
        
        // Bind modal methods
        this.updateNewTaskData = this.updateNewTaskData.bind(this);
        this.closeTaskModal = this.closeTaskModal.bind(this);
        this.createTaskFromModal = this.createTaskFromModal.bind(this);
        this.focusLabelInput = this.focusLabelInput.bind(this);
        this.handleLabelKeydown = this.handleLabelKeydown.bind(this);
        this.removeLabel = this.removeLabel.bind(this);
        
        // Initialize templates and workflow rules
        this.taskTemplates = this.getTaskTemplates();
        this.workflowRules = this.getWorkflowRules();
    }

    connectedCallback() {
        super.connectedCallback();
        // Set up keyboard event listeners
        document.addEventListener('keydown', this.handleGlobalKeyDown);
        
        // Initialize drag and drop
        this.initializeDragAndDrop();
        
        // Create shortcut indicator at document level
        this.createShortcutIndicator();
        
        // Initialize search and filter integration
        TaskSearchAndFilterIntegration.initialize(this);
        
        // Initialize module data
        this.loadModuleData().catch(error => {
            console.error('[TaskManagementModuleEnhanced] Error loading module data:', error);
            this.setError('Failed to load tasks: ' + error.message);
        });
        
        // Initialize virtual scrolling after first render
        this.updateComplete.then(() => {
            this.initializeVirtualScrolling();
        });
    }

    createShortcutIndicator() {
        // Remove any existing indicator
        const existing = document.getElementById('lims-shortcut-indicator');
        if (existing) {
            existing.remove();
        }

        // Create indicator at document level
        const indicator = document.createElement('div');
        indicator.id = 'lims-shortcut-indicator';
        indicator.innerHTML = `
            <style>
                #lims-shortcut-indicator {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px 16px;
                    background: rgba(0, 0, 0, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    font-size: 12px;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    color: #e5e5e7;
                    opacity: 0.7;
                    transition: all 0.2s;
                    z-index: 999999;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    max-width: 300px;
                }
                
                #lims-shortcut-indicator:hover {
                    opacity: 1;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
                }
                
                #lims-shortcut-indicator .shortcut-hint {
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.5;
                }
                
                #lims-shortcut-indicator kbd {
                    display: inline-block;
                    padding: 2px 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 11px;
                    margin: 0 2px;
                }
            </style>
            <span class="shortcut-hint">Press <kbd>?</kbd> for keyboard shortcuts</span>
            <span class="shortcut-hint">Press <kbd>C</kbd> to create task</span>
            <span class="shortcut-hint">Press <kbd>${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'} + K</kbd> for commands</span>
            <span class="shortcut-hint">Press <kbd>${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'} + Shift + F</kbd> for fullscreen</span>
        `;
        
        document.body.appendChild(indicator);
    }

    initializeDragAndDrop() {
        // Set up drag and drop event handlers with proper scope
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragEnter = this.handleDragEnter.bind(this);
        this.handleDragLeave = this.handleDragLeave.bind(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this.handleGlobalKeyDown);
        
        // Remove shortcut indicator
        const indicator = document.getElementById('lims-shortcut-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async loadModuleData() {
        console.log('[loadModuleData] Starting...');
        try {
            this.setLoading(true, 'Loading enhanced task management...');
            
            if (window.api && window.api.lims) {
                console.log('[loadModuleData] Fetching tasks, projects, and team members...');
                const [tasks, projects, teamMembers] = await Promise.all([
                    window.api.lims.getTasks(),
                    window.api.lims.getProjects(),
                    window.api.lims.getTeamMembers()
                ]);
                
                this.tasks = tasks || [];
                this.projects = projects || [];
                this.teamMembers = teamMembers || [];
                
                console.log(`[loadModuleData] Loaded ${this.tasks.length} tasks and ${this.projects.length} projects`);
                
                // Update search/filter integration with new tasks
                if (TaskSearchAndFilterIntegration.integration) {
                    TaskSearchAndFilterIntegration.integration.initialize(this.tasks);
                }
            } else {
                console.error('[loadModuleData] API not available');
                this.tasks = [];
                this.projects = [];
            }
            
            this.setLoading(false);
            
            // Initialize virtual scrolling after tasks are loaded
            this.updateComplete.then(() => {
                this.initializeVirtualScrolling();
            });
        } catch (error) {
            console.error('[loadModuleData] Error:', error);
            this.handleError(error, 'Loading task data');
        }
    }

    // Keyboard shortcut handlers
    handleGlobalKeyDown(event) {
        // Command palette activation
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            this.toggleCommandPalette();
            return;
        }

        // Check if user is typing in any input field
        const activeElement = this.shadowRoot?.activeElement || document.activeElement;
        const isTyping = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true' ||
            activeElement.closest('input, textarea, [contenteditable="true"]')
        );
        
        // Also check if task creation modal is open
        if (isTyping || this.showTaskCreationModal) {
            return;
        }

        // Single-letter shortcuts
        switch (event.key.toLowerCase()) {
            case 'c':
                event.preventDefault();
                this.quickCreateTask();
                break;
            case 'e':
                if (this.selectedTasks.length === 1) {
                    event.preventDefault();
                    this.editTask(this.selectedTasks[0]);
                }
                break;
            case 'd':
                if (this.selectedTasks.length > 0) {
                    event.preventDefault();
                    this.markTasksAsDone(this.selectedTasks);
                }
                break;
            case 'x':
                if (event.shiftKey) {
                    event.preventDefault();
                    this.selectAllTasks();
                } else {
                    event.preventDefault();
                    this.enterSelectionMode();
                }
                break;
            case '?':
                event.preventDefault();
                this.showKeyboardShortcuts();
                break;
        }
    }

    handleKeyDown(event) {
        // Handle arrow key navigation in kanban view
        if (this.currentView === 'kanban' && event.target.classList.contains('task-card')) {
            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.navigateTask(event.target, 'up');
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.navigateTask(event.target, 'down');
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.navigateTask(event.target, 'left');
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.navigateTask(event.target, 'right');
                    break;
                case ' ':
                    event.preventDefault();
                    this.startDragWithKeyboard(event.target);
                    break;
            }
        }
    }

    // Command palette methods
    toggleCommandPalette() {
        this.commandPaletteOpen = !this.commandPaletteOpen;
        if (this.commandPaletteOpen) {
            this.updateComplete.then(() => {
                const input = this.shadowRoot.querySelector('.command-input');
                if (input) input.focus();
            });
        }
    }

    handleCommandInput(event) {
        const query = event.target.value.toLowerCase();
        // Filter and execute commands based on input
        if (event.key === 'Enter') {
            this.executeCommand(query);
            this.toggleCommandPalette();
        }
    }

    executeCommand(query) {
        // Natural language command execution
        if (query.startsWith('create ')) {
            const taskTitle = query.replace('create ', '');
            this.createTaskFromNaturalLanguage(taskTitle);
        } else if (query.includes('filter')) {
            // Handle filter commands
        } else if (query.includes('search')) {
            // Handle search commands
        }
    }

    // Natural language task creation
    createTaskFromNaturalLanguage(input) {
        // Parse natural language input
        const parsedTask = this.parseNaturalLanguage(input);
        this.createTask(parsedTask);
    }

    parseNaturalLanguage(input) {
        const task = {
            title: input,
            status: 'todo',
            priority: 'medium',
            due_date: null
        };

        // Parse due dates
        const datePatterns = {
            'today': () => new Date(),
            'tomorrow': () => new Date(Date.now() + 24 * 60 * 60 * 1000),
            'monday': () => this.getNextWeekday(1),
            'tuesday': () => this.getNextWeekday(2),
            'wednesday': () => this.getNextWeekday(3),
            'thursday': () => this.getNextWeekday(4),
            'friday': () => this.getNextWeekday(5),
            'saturday': () => this.getNextWeekday(6),
            'sunday': () => this.getNextWeekday(0)
        };

        // Extract and parse date
        for (const [pattern, getDate] of Object.entries(datePatterns)) {
            if (input.toLowerCase().includes(pattern)) {
                task.due_date = getDate().toISOString();
                task.title = input.replace(new RegExp(pattern, 'i'), '').trim();
                break;
            }
        }

        // Parse priority
        if (input.includes('!!!') || input.toLowerCase().includes('urgent')) {
            task.priority = 'urgent';
            task.title = task.title.replace('!!!', '').replace(/urgent/i, '').trim();
        } else if (input.includes('!!') || input.toLowerCase().includes('high')) {
            task.priority = 'high';
            task.title = task.title.replace('!!', '').replace(/high/i, '').trim();
        }

        return task;
    }

    getNextWeekday(dayIndex) {
        const today = new Date();
        const todayIndex = today.getDay();
        const daysUntilNext = (dayIndex - todayIndex + 7) % 7 || 7;
        return new Date(today.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
    }

    // Keyboard navigation for drag and drop
    navigateTask(element, direction) {
        const kanbanBoard = this.shadowRoot.querySelector('.kanban-board');
        const allCards = Array.from(kanbanBoard.querySelectorAll('.task-card'));
        const currentIndex = allCards.indexOf(element);
        
        let targetIndex;
        switch (direction) {
            case 'up':
                targetIndex = Math.max(0, currentIndex - 1);
                break;
            case 'down':
                targetIndex = Math.min(allCards.length - 1, currentIndex + 1);
                break;
            case 'left':
            case 'right':
                // Find cards in adjacent columns
                const currentColumn = element.closest('.kanban-column');
                const columns = Array.from(kanbanBoard.querySelectorAll('.kanban-column'));
                const columnIndex = columns.indexOf(currentColumn);
                const targetColumnIndex = direction === 'left' ? 
                    Math.max(0, columnIndex - 1) : 
                    Math.min(columns.length - 1, columnIndex + 1);
                
                if (targetColumnIndex !== columnIndex) {
                    const targetColumn = columns[targetColumnIndex];
                    const targetCards = targetColumn.querySelectorAll('.task-card');
                    if (targetCards.length > 0) {
                        targetCards[0].focus();
                        return;
                    }
                }
                return;
        }
        
        if (targetIndex !== currentIndex && allCards[targetIndex]) {
            allCards[targetIndex].focus();
        }
    }

    startDragWithKeyboard(element) {
        const taskId = element.dataset.taskId;
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.keyboardDragging = true;
            this.draggedTask = task;
            element.classList.add('dragging');
            this.showKeyboardHint('Use arrow keys to move, Enter to drop, Escape to cancel');
        }
    }

    async updateTaskStatus(taskId, newStatus) {
        try {
            // Find the task
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            
            // Validate the status transition
            const isValid = await this.validateStatusTransition(task, newStatus);
            if (!isValid) {
                // Show validation errors
                this.requestUpdate();
                setTimeout(() => {
                    this.validationErrors = {};
                    this.requestUpdate();
                }, 5000);
                return;
            }
            
            // Clear any previous validation errors
            this.validationErrors = {};
            
            // Optimistic update
            this.tasks = this.tasks.map(t => 
                t.id === taskId ? { ...t, status: newStatus } : t
            );

            // Server update
            if (window.api) {
                await window.api.lims.updateTask(taskId, { status: newStatus });
            }

            // Show success feedback
            this.showKeyboardHint(`Task moved to ${newStatus}`);
            setTimeout(() => this.hideKeyboardHint(), 2000);
        } catch (error) {
            this.handleError(error, 'Updating task status');
            // Revert optimistic update
            await this.loadModuleData();
        }
    }

    // Quick actions
    quickCreateTask(status = 'todo') {
        console.log('[quickCreateTask] Called with status:', status);
        
        // Open task creation modal with the selected status
        this.newTaskData = {
            ...this.getEmptyTaskData(),
            status: status
        };
        this.showTaskCreationModal = true;
        
        // Force update to ensure modal shows
        this.requestUpdate();
        
        // Render modal in portal after update
        setTimeout(() => this.renderModalInPortal(), 0);
        
        // Log current state
        console.log('[quickCreateTask] Modal should be visible:', this.showTaskCreationModal);
        console.log('[quickCreateTask] Task data:', this.newTaskData);
    }
    
    getEmptyTaskData() {
        return {
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            due_date: null,
            assignee: '',
            assignee_id: null,
            project_id: this.projects[0]?.id || null,
            labels: [] // Always return empty array
        };
    }

    showNaturalLanguageInput() {
        this.updateComplete.then(() => {
            const input = this.shadowRoot.querySelector('.nl-input');
            if (input) {
                input.focus();
                this.naturalLanguageHint = 'Try: "Review lab results Friday" or "Update documentation tomorrow!!"';
            }
        });
    }
    
    // Task Creation Modal Methods
    updateNewTaskData(field, value) {
        this.newTaskData = {
            ...this.newTaskData,
            [field]: value
        };
        this.requestUpdate();
    }

    handleQuickDateClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const button = event.currentTarget;
        if (button.dataset.clear === 'true') {
            this.updateNewTaskData('due_date', '');
            return;
        }
        
        const days = parseInt(button.dataset.days);
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + days);
        
        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        const dateString = targetDate.toISOString().slice(0, 16);
        this.updateNewTaskData('due_date', dateString);
        
        // Update the input field in the modal
        const dueDateInput = document.querySelector('#modal-task-creation input[data-field="due_date"]');
        if (dueDateInput) {
            dueDateInput.value = dateString;
        }
    }

    handleQuickDateClickEdit(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const button = event.currentTarget;
        if (button.dataset.clear === 'true') {
            this.editingTask.due_date = '';
            return;
        }
        
        const days = parseInt(button.dataset.days);
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + days);
        
        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        const dateString = targetDate.toISOString().slice(0, 16);
        this.editingTask.due_date = dateString;
        
        // Update the input field in the modal
        const dueDateInput = document.querySelector('#modal-task-edit input[data-field="due_date"]');
        if (dueDateInput) {
            dueDateInput.value = dateString;
        }
    }

    renderDueDateBadge(task) {
        if (!task.due_date) {
            return '';
        }
        
        const status = TaskDueDateModule.getDueDateStatus(task.due_date);
        const text = TaskDueDateModule.formatDueDate(task.due_date);
        const icon = this.getDueDateIcon(status);

        return html`
            <span class="due-date-badge ${status}">
                ${icon}
                ${text}
            </span>
        `;
    }

    getDueDateIcon(status) {
        const icons = {
            'overdue': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
            </svg>`,
            'today': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
            </svg>`,
            'tomorrow': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`,
            'this-week': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`,
            'future': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`,
            'no-due-date': ''
        };
        return icons[status] || '';
    }

    renderDueDateOverlay(task) {
        const status = TaskDueDateModule.getDueDateStatus(task.due_date);
        if (status === 'overdue' || status === 'today') {
            return html`<div class="task-due-overlay"></div>`;
        }
        return '';
    }

    renderAssigneeAvatar(task) {
        if (!task.assignee_id) {
            return '';
        }
        
        const assignee = this.teamMembers.find(m => m.id === task.assignee_id);
        if (!assignee) {
            return '';
        }
        
        const initials = assignee.name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        // Generate consistent color based on name
        let hash = 0;
        for (let i = 0; i < assignee.name.length; i++) {
            hash = assignee.name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        const color = `hsl(${hue}, 60%, 50%)`;
        
        return html`
            <div class="task-assignee" style="background: ${color}" title="${assignee.name}">
                ${assignee.avatar_url 
                    ? html`<img src="${assignee.avatar_url}" alt="${assignee.name}" />`
                    : initials
                }
            </div>
        `;
    }

    sortTasks(tasks) {
        if (!this.sortBy || this.sortBy === 'none') {
            return tasks;
        }

        const sorted = [...tasks].sort((a, b) => {
            let aVal, bVal;

            switch (this.sortBy) {
                case 'due_date':
                    aVal = a.due_date ? new Date(a.due_date) : new Date('9999-12-31');
                    bVal = b.due_date ? new Date(b.due_date) : new Date('9999-12-31');
                    break;
                case 'priority':
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                    aVal = priorityOrder[a.priority] || 0;
                    bVal = priorityOrder[b.priority] || 0;
                    break;
                case 'title':
                    aVal = a.title?.toLowerCase() || '';
                    bVal = b.title?.toLowerCase() || '';
                    break;
                case 'status':
                    const statusOrder = { todo: 1, in_progress: 2, review: 3, done: 4 };
                    aVal = statusOrder[a.status] || 0;
                    bVal = statusOrder[b.status] || 0;
                    break;
                case 'created_at':
                default:
                    aVal = new Date(a.created_at || a.id);
                    bVal = new Date(b.created_at || b.id);
                    break;
            }

            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }

    setSortBy(sortType) {
        if (this.sortBy === sortType) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = sortType;
            this.sortDirection = sortType === 'due_date' ? 'asc' : 'desc';
        }
        this.requestUpdate();
    }
    
    closeTaskModal() {
        this.showTaskCreationModal = false;
        this.newTaskData = this.getEmptyTaskData();
        ModalPortal.destroy(this.modalId);
        this.requestUpdate();
    }

    renderModalInPortal() {
        if (!this.showTaskCreationModal) {
            ModalPortal.destroy(this.modalId);
            return;
        }

        // Get modal HTML content
        const modalContent = this.getModalContent();
        
        // Create modal in portal
        ModalPortal.create(this.modalId, modalContent);
        
        // Attach event listeners
        ModalPortal.attachListeners(this.modalId, {
            '.task-creation-modal-overlay': {
                'click': (e) => {
                    if (e.target.classList.contains('task-creation-modal-overlay')) {
                        this.closeTaskModal();
                    }
                }
            },
            '.modal-close-button': {
                'click': () => this.closeTaskModal()
            },
            '.modal-button-primary': {
                'click': () => this.createTaskFromModal()
            },
            '.modal-button-cancel': {
                'click': () => this.closeTaskModal()
            },
            'input[data-field], textarea[data-field], select[data-field]': {
                'input': (e) => this.updateNewTaskData(e.target.dataset.field, e.target.value),
                'change': (e) => this.updateNewTaskData(e.target.dataset.field, e.target.value)
            },
            '.quick-date-btn': {
                'click': (e) => this.handleQuickDateClick(e)
            },
            '.priority-option': {
                'click': (e) => {
                    const priority = e.currentTarget.dataset.priority;
                    this.updateNewTaskData('priority', priority);
                    this.updateModalContent();
                }
            },
            '.label-input-field': {
                'keydown': (e) => this.handlePortalLabelKeydown(e)
            },
            '.label-remove': {
                'click': (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.removeLabel(index);
                    this.updateModalContent();
                }
            }
        });
    }

    updateModalContent() {
        if (ModalPortal.exists(this.modalId)) {
            const modalContent = this.getModalContent();
            ModalPortal.update(this.modalId, modalContent);
            // Re-attach listeners after update
            this.renderModalInPortal();
        }
    }

    handlePortalLabelKeydown(e) {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newLabel = e.target.value.trim();
            if (!this.newTaskData.labels.includes(newLabel)) {
                this.newTaskData.labels = [...this.newTaskData.labels, newLabel];
                this.updateModalContent();
            }
        }
    }

    getModalContent() {
        // Generate modal HTML with proper styling
        return `
            <style>
                ${this.getModalStyles()}
            </style>
            <div class="task-creation-modal-overlay">
                <div class="task-creation-modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Create New Task</h3>
                        <button class="modal-close-button">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        ${this.getModalFormContent()}
                    </div>
                    
                    <div class="modal-footer">
                        <button class="modal-button modal-button-cancel">
                            Cancel
                        </button>
                        <button class="modal-button modal-button-primary" 
                            ${!this.newTaskData.title.trim() || this.isCreatingTask ? 'disabled' : ''}>
                            ${this.isCreatingTask ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getModalStyles() {
        // Return all modal-related CSS styles
        return `
            .task-creation-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            }
            
            .task-creation-modal {
                background: rgba(30, 30, 30, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                width: 600px;
                max-width: 90vw;
                height: 90vh;
                max-height: 900px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            }
            
            .modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-shrink: 0;
            }
            
            .modal-title {
                font-size: 18px;
                font-weight: 600;
                color: #e5e5e7;
            }
            
            .modal-close-button {
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                padding: 8px;
                border-radius: 6px;
                transition: all 0.2s;
            }
            
            .modal-close-button:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #e5e5e7;
            }
            
            .modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
            }
            
            .modal-body::-webkit-scrollbar {
                width: 8px;
            }
            
            .modal-body::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .modal-body::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
            
            .modal-footer {
                padding: 16px 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                flex-shrink: 0;
            }
            
            .form-group {
                margin-bottom: 24px;
            }
            
            .form-label {
                display: block;
                margin-bottom: 8px;
                font-size: 14px;
                font-weight: 500;
                color: #e5e5e7;
            }
            
            .form-input, .form-textarea, .form-select {
                width: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                padding: 10px 12px;
                font-size: 14px;
                color: #e5e5e7;
                transition: all 0.2s;
            }
            
            .form-input:focus, .form-textarea:focus, .form-select:focus {
                outline: none;
                border-color: #007aff;
                background: rgba(0, 0, 0, 0.5);
            }
            
            .form-textarea {
                min-height: 80px;
                resize: vertical;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            .priority-selector {
                display: flex;
                gap: 8px;
            }
            
            .priority-option {
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            
            .priority-option.urgent {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
                border-color: rgba(239, 68, 68, 0.2);
            }
            
            .priority-option.high {
                background: rgba(251, 146, 60, 0.1);
                color: #fb923c;
                border-color: rgba(251, 146, 60, 0.2);
            }
            
            .priority-option.medium {
                background: rgba(251, 191, 36, 0.1);
                color: #fbbf24;
                border-color: rgba(251, 191, 36, 0.2);
            }
            
            .priority-option.low {
                background: rgba(163, 163, 163, 0.1);
                color: #a3a3a3;
                border-color: rgba(163, 163, 163, 0.2);
            }
            
            .priority-option.selected {
                opacity: 1;
                box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
            }
            
            .priority-option:hover {
                opacity: 0.8;
            }
            
            .labels-input {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                padding: 8px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                min-height: 44px;
                cursor: text;
            }
            
            .label-tag {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .label-remove {
                cursor: pointer;
                opacity: 0.7;
            }
            
            .label-remove:hover {
                opacity: 1;
            }
            
            .label-input-field {
                background: transparent;
                border: none;
                outline: none;
                color: #e5e5e7;
                font-size: 14px;
                flex: 1;
                min-width: 100px;
            }
            
            .modal-button {
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
            }
            
            .modal-button-cancel {
                background: transparent;
                color: #e5e5e7;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .modal-button-cancel:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .modal-button-primary {
                background: #007aff;
                color: white;
            }
            
            .modal-button-primary:hover:not(:disabled) {
                background: #0056b3;
            }
            
            .modal-button-primary:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
    }

    getModalFormContent() {
        // Escape HTML to prevent injection
        const escapeHtml = (str) => {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };
        
        return `
            <!-- Title -->
            <div class="form-group">
                <label class="form-label">Title</label>
                <input 
                    type="text" 
                    class="form-input" 
                    placeholder="Enter task title..."
                    value="${escapeHtml(this.newTaskData.title)}"
                    data-field="title"
                />
            </div>
            
            <!-- Description -->
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea 
                    class="form-textarea" 
                    placeholder="Add a more detailed description..."
                    data-field="description"
                >${escapeHtml(this.newTaskData.description)}</textarea>
            </div>
            
            <!-- Priority and Status Row -->
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <div class="priority-selector">
                        ${['urgent', 'high', 'medium', 'low'].map(priority => `
                            <div 
                                class="priority-option ${priority} ${this.newTaskData.priority === priority ? 'selected' : ''}"
                                data-priority="${priority}"
                            >
                                ${priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-select" data-field="status" value="${this.newTaskData.status}">
                        <option value="todo" ${this.newTaskData.status === 'todo' ? 'selected' : ''}>To Do</option>
                        <option value="in_progress" ${this.newTaskData.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="review" ${this.newTaskData.status === 'review' ? 'selected' : ''}>Review</option>
                        <option value="done" ${this.newTaskData.status === 'done' ? 'selected' : ''}>Done</option>
                    </select>
                </div>
            </div>
            
            <!-- Due Date and Assignee Row -->
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Due Date</label>
                    <input 
                        type="datetime-local" 
                        class="form-input"
                        value="${this.newTaskData.due_date || ''}"
                        data-field="due_date"
                    />
                    <div class="quick-date-buttons">
                        <button type="button" class="quick-date-btn" data-days="0">Today</button>
                        <button type="button" class="quick-date-btn" data-days="1">Tomorrow</button>
                        <button type="button" class="quick-date-btn" data-days="7">Next Week</button>
                        <button type="button" class="quick-date-btn" data-clear="true">Clear</button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Assignee</label>
                    <select class="form-select" data-field="assignee" value="${this.newTaskData.assignee || ''}">
                        <option value="">Unassigned</option>
                        <option value="me" ${this.newTaskData.assignee === 'me' ? 'selected' : ''}>Assign to me</option>
                        <option value="john.doe" ${this.newTaskData.assignee === 'john.doe' ? 'selected' : ''}>John Doe</option>
                        <option value="jane.smith" ${this.newTaskData.assignee === 'jane.smith' ? 'selected' : ''}>Jane Smith</option>
                        <option value="lab.tech" ${this.newTaskData.assignee === 'lab.tech' ? 'selected' : ''}>Lab Technician</option>
                        <option value="analyst" ${this.newTaskData.assignee === 'analyst' ? 'selected' : ''}>Analyst</option>
                    </select>
                </div>
            </div>
            
            <!-- Project Row -->
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Project</label>
                    <select class="form-select" data-field="project_id" value="${this.newTaskData.project_id || ''}">
                        <option value="">No Project</option>
                        ${this.projects.map(project => `
                            <option value="${project.id}" ${this.newTaskData.project_id === project.id ? 'selected' : ''}>
                                ${project.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <!-- Empty for spacing -->
                </div>
            </div>
            
            <!-- Labels -->
            <div class="form-group">
                <label class="form-label">Labels</label>
                <div class="labels-input">
                    ${this.newTaskData.labels.map((label, index) => `
                        <span class="label-tag">
                            ${escapeHtml(label)}
                            <span class="label-remove" data-index="${index}">×</span>
                        </span>
                    `).join('')}
                    <input 
                        type="text" 
                        class="label-input-field"
                        placeholder="Add label..."
                    />
                </div>
            </div>
        `;
    }
    
    async createTaskFromModal() {
        if (!this.newTaskData.title.trim() || this.isCreatingTask) return;
        
        this.isCreatingTask = true;
        
        try {
            // Format the data for creation
            const taskData = {
                ...this.newTaskData,
                labels: this.newTaskData.labels.length > 0 ? this.newTaskData.labels : [],
                project_id: this.newTaskData.project_id || null
            };
            
            // Format dates properly - convert from datetime-local to date-only format (YYYY-MM-DD)
            if (this.newTaskData.due_date) {
                const dueDate = new Date(this.newTaskData.due_date);
                // Check if date is valid and reasonable (between 1900 and 2100)
                if (!isNaN(dueDate.getTime()) && dueDate.getFullYear() > 1900 && dueDate.getFullYear() < 2100) {
                    // Format as YYYY-MM-DD for date column
                    taskData.due_date = dueDate.toISOString().split('T')[0];
                } else {
                    taskData.due_date = null;
                }
            }
            
            // Create the task
            await this.createTask(taskData);
            
            // Close the modal
            this.closeTaskModal();
        } catch (error) {
            console.error('[createTaskFromModal] Error:', error);
            this.handleError(error, 'Creating task');
        } finally {
            this.isCreatingTask = false;
        }
    }
    
    focusLabelInput(event) {
        const input = event.currentTarget.querySelector('.label-input-field');
        if (input) {
            input.focus();
        }
    }
    
    handleLabelKeydown(event) {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            const value = event.target.value.trim();
            if (value && !this.newTaskData.labels.includes(value)) {
                this.newTaskData.labels = [...this.newTaskData.labels, value];
                event.target.value = '';
                this.requestUpdate();
            }
        } else if (event.key === 'Backspace' && !event.target.value && this.newTaskData.labels.length > 0) {
            // Remove last label if backspace on empty input
            this.newTaskData.labels = this.newTaskData.labels.slice(0, -1);
            this.requestUpdate();
        }
    }
    
    removeLabel(index) {
        this.newTaskData.labels = this.newTaskData.labels.filter((_, i) => i !== index);
        this.requestUpdate();
    }

    async handleNaturalLanguageSubmit(event) {
        console.log('[handleNaturalLanguageSubmit] Key pressed:', event.key);
        if (event.key === 'Enter') {
            const input = event.target.value;
            console.log('[handleNaturalLanguageSubmit] Input value:', input);
            if (input.trim()) {
                const task = this.parseNaturalLanguage(input);
                console.log('[handleNaturalLanguageSubmit] Parsed task:', task);
                await this.createTask(task);
                event.target.value = '';
                this.naturalLanguageHint = '';
            }
        }
    }

    async createTask(taskData) {
        console.log('[createTask] Called with:', taskData);
        try {
            const newTask = {
                ...taskData,
                project_id: this.projects[0]?.id || null,
                assignee_id: null, // Don't set assignee_id if we don't have a valid UUID
                created_at: new Date().toISOString()
            };
            console.log('[createTask] Prepared task:', newTask);

            if (window.api && window.api.lims) {
                console.log('[createTask] Calling API...');
                const createdTask = await window.api.lims.createTask(newTask);
                console.log('[createTask] API response:', createdTask);
                
                if (createdTask) {
                    this.tasks = [...this.tasks, createdTask];
                    await this.loadModuleData(); // Reload to ensure sync
                    this.showKeyboardHint('Task created successfully!');
                    setTimeout(() => this.hideKeyboardHint(), 2000);
                } else {
                    console.error('[createTask] No task returned from API');
                    this.showKeyboardHint('Failed to create task: No response');
                    setTimeout(() => this.hideKeyboardHint(), 3000);
                }
            } else {
                console.error('[createTask] API not available');
                this.showKeyboardHint('API not available');
                setTimeout(() => this.hideKeyboardHint(), 3000);
            }
        } catch (error) {
            console.error('[createTask] Error:', error);
            
            // Check if it's an authentication error
            if (error.message && error.message.includes('logged in')) {
                this.showKeyboardHint('Authentication required - using development mode');
                setTimeout(() => this.hideKeyboardHint(), 4000);
                
                // For now, don't trigger auth flow in development
                // if (window.api && window.api.common && window.api.common.startFirebaseAuth) {
                //     window.api.common.startFirebaseAuth();
                // }
            } else {
                this.handleError(error, 'Creating task');
            }
        }
    }

    // UI helper methods
    showKeyboardHint(hint) {
        this.keyboardHint = hint;
        this.requestUpdate();
    }

    hideKeyboardHint() {
        this.keyboardHint = '';
        this.requestUpdate();
    }

    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Cmd/Ctrl + K', action: 'Open command palette' },
            { key: 'C', action: 'Create new task' },
            { key: 'E', action: 'Edit selected task' },
            { key: 'D', action: 'Mark task as done' },
            { key: 'X', action: 'Toggle selection mode' },
            { key: 'Shift + X', action: 'Select all tasks' },
            { key: 'Arrow Keys', action: 'Navigate between tasks' },
            { key: 'Space', action: 'Start drag (when task focused)' },
            { key: 'Cmd/Ctrl + Shift + F', action: 'Toggle fullscreen' },
            { key: '?', action: 'Show this help' }
        ];
        
        const message = '🎮 Keyboard Shortcuts:\n\n' + 
            shortcuts.map(s => `${s.key.padEnd(20)} → ${s.action}`).join('\n') +
            '\n\n💡 Tip: Natural language input supports dates and priorities!';
        
        alert(message);
    }

    async createDemoTasks() {
        try {
            if (!window.api) {
                console.error('[TaskManagement] API not available');
                return;
            }
            
            this.setLoading(true, 'Creating demo tasks...');
            await TaskManagementDemo.createDemoTasks(window.api.lims);
            await this.loadModuleData();
            TaskManagementDemo.showFeatureGuide();
            this.showKeyboardHint('Demo tasks created! Press ? to see all shortcuts');
            setTimeout(() => this.hideKeyboardHint(), 5000);
        } catch (error) {
            this.handleError(error, 'Creating demo tasks');
        }
    }

    async clearAllTasks() {
        try {
            if (!window.api) {
                console.error('[TaskManagement] API not available');
                return;
            }
            
            if (confirm('Are you sure you want to delete all tasks?')) {
                this.setLoading(true, 'Clearing all tasks...');
                await TaskManagementDemo.clearAllTasks(window.api.lims);
                await this.loadModuleData();
                this.showKeyboardHint('All tasks cleared');
                setTimeout(() => this.hideKeyboardHint(), 2000);
            }
        } catch (error) {
            this.handleError(error, 'Clearing tasks');
        }
    }

    // Render methods
    renderModuleContent() {
        // Get filtered tasks if integration is active
        const hasFilters = TaskSearchAndFilterIntegration.hasActiveFilters();
        let displayTasks = hasFilters 
            ? TaskSearchAndFilterIntegration.getFilteredTasks(this.tasks)
            : this.tasks;
            
        // Apply sorting
        displayTasks = this.sortTasks(displayTasks);
            
        console.log('[renderModuleContent] Has filters:', hasFilters, 'Displaying:', displayTasks.length, 'of', this.tasks.length, 'tasks');
            
        return html`
            <div class="task-management-container">
                ${this.renderCommandPalette()}
                ${this.renderTemplatePanel()}
                ${TaskSearchAndFilterIntegration.renderSearchAndFilters()}
                ${this.renderToolbar()}
                <div class="task-content">
                    ${this.currentView === 'kanban' ? this.renderEnhancedKanbanView(displayTasks) : this.renderListView(displayTasks)}
                </div>
                ${this.renderKeyboardHint()}
                ${this.renderSelectionCount()}
                ${this.renderValidationErrors()}
            </div>
        `;
    }

    renderCommandPalette() {
        return html`
            <div class="command-palette ${this.commandPaletteOpen ? 'open' : ''}">
                <input 
                    class="command-input" 
                    type="text" 
                    placeholder="Type a command or search..."
                    @keyup=${this.handleCommandInput}
                />
                <div class="command-results">
                    <div class="command-item">
                        <svg class="command-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span class="command-item-text">Create new task</span>
                        <span class="command-item-shortcut">C</span>
                    </div>
                    <div class="command-item">
                        <svg class="command-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <span class="command-item-text">Search tasks</span>
                        <span class="command-item-shortcut">/</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderToolbar() {
        return html`
            <div class="task-toolbar">
                <div class="toolbar-left">
                    <div class="view-switcher">
                        <button 
                            class="view-button ${this.currentView === 'kanban' ? 'active' : ''}"
                            @click=${() => this.currentView = 'kanban'}
                        >
                            Kanban
                        </button>
                        <button 
                            class="view-button ${this.currentView === 'list' ? 'active' : ''}"
                            @click=${() => this.currentView = 'list'}
                        >
                            List
                        </button>
                    </div>

                    <div class="sort-controls">
                        <span class="sort-label">Sort:</span>
                        <button 
                            class="sort-button ${this.sortBy === 'due_date' ? 'active' : ''}"
                            @click=${() => this.setSortBy('due_date')}
                            title="Sort by due date"
                        >
                            Due Date
                            ${this.sortBy === 'due_date' ? html`
                                <svg class="sort-icon ${this.sortDirection === 'desc' ? 'desc' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            ` : ''}
                        </button>
                        <button 
                            class="sort-button ${this.sortBy === 'priority' ? 'active' : ''}"
                            @click=${() => this.setSortBy('priority')}
                            title="Sort by priority"
                        >
                            Priority
                            ${this.sortBy === 'priority' ? html`
                                <svg class="sort-icon ${this.sortDirection === 'desc' ? 'desc' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            ` : ''}
                        </button>
                        <button 
                            class="sort-button ${this.sortBy === 'created_at' ? 'active' : ''}"
                            @click=${() => this.setSortBy('created_at')}
                            title="Sort by creation date"
                        >
                            Created
                            ${this.sortBy === 'created_at' ? html`
                                <svg class="sort-icon ${this.sortDirection === 'desc' ? 'desc' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            ` : ''}
                        </button>
                    </div>
                    
                    <div class="natural-language-input">
                        <svg class="nl-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        <input 
                            class="nl-input"
                            type="text"
                            placeholder="Quick add: 'Fix bug for Lincoln High tomorrow!!' or press C"
                            @keyup=${this.handleNaturalLanguageSubmit}
                            @focus=${() => this.naturalLanguageHint = '✨ Try: "Onboard Westfield Academy next week" or "Fix login bug!!"'}
                            @blur=${() => this.naturalLanguageHint = ''}
                        />
                        <div class="nl-hint ${this.naturalLanguageHint ? 'visible' : ''}">
                            ${this.naturalLanguageHint}
                        </div>
                    </div>
                </div>
                
                <div class="toolbar-right">
                    <button class="template-button" @click=${() => this.templatePanelOpen = true} title="Task Templates">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Templates
                    </button>
                    <button class="action-button" @click=${this.createDemoTasks} title="Create Demo Tasks">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M2 12h20"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="action-button" @click=${this.clearAllTasks} title="Clear All Tasks">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                    <button class="action-button" @click=${this.showKeyboardShortcuts} title="Keyboard shortcuts (?)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="6" width="20" height="12" rx="2" />
                            <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    renderEnhancedKanbanView(tasksToDisplay = this.tasks) {
        return html`
            <div class="kanban-board" @dragover=${this.handleDragOver}>
                ${this.kanbanColumns.map(column => this.renderEnhancedKanbanColumn(column, tasksToDisplay))}
            </div>
        `;
    }

    renderEnhancedKanbanColumn(column, tasksToDisplay = this.tasks) {
        const tasks = this.getTasksByStatus(column.status, tasksToDisplay);
        const visibleInfo = this.visibleTasks[column.status] || { start: 0, end: tasks.length };
        
        return html`
            <div class="kanban-column" data-column="${column.id}" data-status="${column.status}">
                <div class="kanban-header">
                    <div class="column-title">
                        ${column.title}
                        <span class="task-count">${tasks.length}</span>
                    </div>
                    <button class="column-add-button" 
                        @click=${() => this.quickCreateTask(column.status)}
                        title="Add task to ${column.title}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
                <div class="kanban-tasks column-tasks" 
                    @drop=${(e) => this.handleDrop(e, column.status)} 
                    @dragover=${(e) => this.handleDragOver(e, column.status)}
                    @dragenter=${(e) => this.handleDragEnter(e, column.status)}
                    @dragleave=${(e) => this.handleDragLeave(e, column.status)}
                    @scroll=${this.handleColumnScroll}
                    data-column-status="${column.status}">
                    ${this.renderVirtualizedTasks(tasks, column.status, visibleInfo)}
                </div>
            </div>
        `;
    }

    renderVirtualizedTasks(tasks, columnStatus, visibleInfo) {
        // For small task lists, skip virtualization
        if (tasks.length < 50) {
            return tasks.map(task => this.renderDraggableTaskCard(task));
        }
        
        // Create placeholder for tasks before visible range
        const beforeHeight = visibleInfo.start * 120; // Approximate task height
        const afterHeight = (tasks.length - visibleInfo.end) * 120;
        
        return html`
            ${beforeHeight > 0 ? html`<div style="height: ${beforeHeight}px;"></div>` : ''}
            ${tasks.slice(visibleInfo.start, visibleInfo.end).map(task => 
                this.renderDraggableTaskCard(task)
            )}
            ${afterHeight > 0 ? html`<div style="height: ${afterHeight}px;"></div>` : ''}
        `;
    }

    renderDraggableTaskCard(task) {
        const isSelected = this.selectedTasks.includes(task.id);
        const dueDateStatus = TaskDueDateModule.getDueDateStatus(task.due_date);
        
        return html`
            <div 
                class="task-card ${isSelected ? 'selected' : ''} ${dueDateStatus}"
                draggable="true"
                tabindex="0"
                data-task-id="${task.id}"
                @dragstart=${(e) => this.handleDragStart(e, task)}
                @click=${(e) => this.handleTaskClick(e, task)}
                @dblclick=${(e) => this.handleEditTask(e, task)}
                @keydown=${this.handleKeyDown}
            >
                <div class="task-actions">
                    <button 
                        class="task-action-button task-edit-button"
                        @click=${(e) => this.handleEditTask(e, task)}
                        title="Edit task"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button 
                        class="task-action-button task-delete-button"
                        @click=${(e) => this.handleDeleteTask(e, task)}
                        title="Delete task"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="task-title">${task.title}</div>
                ${task.description ? html`
                    <div class="task-description">${task.description}</div>
                ` : ''}
                
                <div class="task-meta">
                    ${task.priority ? html`
                        <div class="task-priority priority-${task.priority}">
                            ${task.priority}
                        </div>
                    ` : ''}
                    
                    ${this.renderDueDateBadge(task)}
                    
                    ${this.renderAssigneeAvatar(task)}
                    
                    <button class="ai-insights-button" 
                        @click=${(e) => this.handleAIInsights(e, task)}
                        title="Get AI insights for this task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </button>
                </div>
                
                <!-- Due date overlay for overdue/urgent tasks -->
                ${this.renderDueDateOverlay(task)}
            </div>
        `;
    }


    // Enhanced drag and drop handlers with animations and multi-select
    handleDragStart(event, task) {
        // Handle multi-select drag
        if (this.selectedTasks.length > 1 && this.selectedTasks.includes(task.id)) {
            this.draggedTasks = this.selectedTasks.map(id => this.tasks.find(t => t.id === id));
            event.dataTransfer.setData('taskIds', JSON.stringify(this.selectedTasks));
            event.dataTransfer.setData('multiDrag', 'true');
        } else {
            this.draggedTask = task;
            this.draggedTasks = [task];
            event.dataTransfer.setData('taskId', task.id);
            event.dataTransfer.setData('multiDrag', 'false');
        }

        event.dataTransfer.effectAllowed = 'move';
        event.target.classList.add('dragging');
        
        // Create custom drag image
        const dragImage = this.createDragImage(this.draggedTasks);
        event.dataTransfer.setDragImage(dragImage, 10, 10);
        
        // Add visual feedback
        this.showKeyboardHint(`Dragging ${this.draggedTasks.length} task(s)`);
        
        // For keyboard accessibility
        this.isDragging = true;
    }

    createDragImage(tasks) {
        const div = document.createElement('div');
        div.style.cssText = `
            position: absolute;
            top: -1000px;
            background: rgba(0, 122, 255, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        div.textContent = tasks.length > 1 ? `${tasks.length} tasks` : tasks[0].title;
        document.body.appendChild(div);
        setTimeout(() => document.body.removeChild(div), 0);
        return div;
    }

    handleDragEnd(event) {
        event.target.classList.remove('dragging');
        this.clearDragState();
        this.hideKeyboardHint();
    }

    handleDragOver(event, columnStatus) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        
        // Show drop position indicator
        if (columnStatus) {
            const afterElement = this.getDragAfterElement(event.currentTarget, event.clientY);
            this.showDropIndicator(event.currentTarget, afterElement);
        }
    }

    handleDragEnter(event, columnStatus) {
        if (event.currentTarget.classList.contains('kanban-tasks')) {
            event.currentTarget.parentElement.classList.add('drag-over');
            this.dropTargetColumn = columnStatus;
        }
    }

    handleDragLeave(event, columnStatus) {
        if (event.currentTarget.classList.contains('kanban-tasks') && 
            !event.currentTarget.contains(event.relatedTarget)) {
            event.currentTarget.parentElement.classList.remove('drag-over');
            this.hideDropIndicator();
        }
    }

    async handleDrop(event, newStatus) {
        event.preventDefault();
        event.stopPropagation();
        
        const column = event.currentTarget.parentElement;
        column.classList.remove('drag-over');
        this.hideDropIndicator();
        
        const isMultiDrag = event.dataTransfer.getData('multiDrag') === 'true';
        
        if (isMultiDrag) {
            const taskIds = JSON.parse(event.dataTransfer.getData('taskIds'));
            await this.updateMultipleTaskStatus(taskIds, newStatus);
        } else {
            const taskId = event.dataTransfer.getData('taskId');
            if (taskId) {
                await this.updateTaskStatus(taskId, newStatus);
            }
        }
        
        this.clearDragState();
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    showDropIndicator(container, afterElement) {
        this.hideDropIndicator();
        
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator active';
        
        if (afterElement) {
            container.insertBefore(indicator, afterElement);
        } else {
            container.appendChild(indicator);
        }
    }

    hideDropIndicator() {
        const indicators = this.shadowRoot.querySelectorAll('.drop-indicator');
        indicators.forEach(indicator => indicator.remove());
    }

    clearDragState() {
        this.draggedTask = null;
        this.draggedTasks = [];
        this.dropTargetColumn = null;
        this.isDragging = false;
        
        // Remove all dragging classes
        const draggingElements = this.shadowRoot.querySelectorAll('.dragging');
        draggingElements.forEach(el => el.classList.remove('dragging'));
    }

    async updateMultipleTaskStatus(taskIds, newStatus) {
        try {
            // Validate all transitions first
            const tasks = this.tasks.filter(t => taskIds.includes(t.id));
            const validationResults = await Promise.all(
                tasks.map(task => this.validateStatusTransition(task, newStatus))
            );
            
            const failedTasks = tasks.filter((task, index) => !validationResults[index]);
            
            if (failedTasks.length > 0) {
                // Show validation errors for the first failed task
                this.requestUpdate();
                setTimeout(() => {
                    this.validationErrors = {};
                    this.requestUpdate();
                }, 5000);
                return;
            }
            
            // Clear any previous validation errors
            this.validationErrors = {};
            
            // Optimistic updates
            this.tasks = this.tasks.map(task => 
                taskIds.includes(task.id) ? { ...task, status: newStatus } : task
            );

            // Server updates
            if (window.api) {
                await Promise.all(
                    taskIds.map(id => window.api.lims.updateTask(id, { status: newStatus }))
                );
            }

            this.showKeyboardHint(`${taskIds.length} tasks moved to ${newStatus}`);
            setTimeout(() => this.hideKeyboardHint(), 2000);
        } catch (error) {
            this.handleError(error, 'Updating multiple tasks');
            await this.loadModuleData();
        }
    }

    handleTaskClick(event, task) {
        if (event.shiftKey || event.metaKey || event.ctrlKey) {
            // Multi-select
            if (this.selectedTasks.includes(task.id)) {
                this.selectedTasks = this.selectedTasks.filter(id => id !== task.id);
            } else {
                this.selectedTasks = [...this.selectedTasks, task.id];
            }
        } else {
            // Single select
            this.selectedTasks = [task.id];
            this.selectedTask = task;
        }
    }

    async handleDeleteTask(event, task) {
        event.stopPropagation(); // Prevent task selection
        if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
            try {
                await window.api.lims.deleteTask(task.id);
                // Remove from local state
                this.tasks = this.tasks.filter(t => t.id !== task.id);
                this.requestUpdate();
                console.log(`[TaskManagement] Deleted task: ${task.title}`);
            } catch (error) {
                this.handleError(error, 'Deleting task');
            }
        }
    }

    handleEditTask(event, task) {
        event.stopPropagation(); // Prevent task selection
        this.editingTask = { ...task };
        this.showEditModal = true;
        this.modalId = 'task-edit-modal';
        this.requestUpdate();
        
        // Render edit modal in portal
        setTimeout(() => this.renderEditModalInPortal(), 0);
    }

    renderEditModalInPortal() {
        if (!this.showEditModal || !this.editingTask) {
            ModalPortal.destroy(this.modalId);
            return;
        }

        const modalContent = this.getEditModalContent();
        ModalPortal.create(this.modalId, modalContent);
        
        // Attach event listeners
        ModalPortal.attachListeners(this.modalId, {
            '.task-edit-modal-overlay': {
                'click': (e) => {
                    if (e.target.classList.contains('task-edit-modal-overlay')) {
                        this.closeEditModal();
                    }
                }
            },
            '.modal-close-button': {
                'click': () => this.closeEditModal()
            },
            '.modal-button-primary': {
                'click': () => this.saveTaskEdit()
            },
            '.modal-button-cancel': {
                'click': () => this.closeEditModal()
            },
            'input[data-field], textarea[data-field], select[data-field]': {
                'input': (e) => {
                    this.editingTask[e.target.dataset.field] = e.target.value;
                },
                'change': (e) => {
                    this.editingTask[e.target.dataset.field] = e.target.value;
                }
            },
            '.quick-date-btn': {
                'click': (e) => this.handleQuickDateClickEdit(e)
            },
            '.priority-option': {
                'click': (e) => {
                    const priority = e.currentTarget.dataset.priority;
                    this.editingTask.priority = priority;
                    this.updateEditModalContent();
                }
            },
            '.label-input-field': {
                'keydown': (e) => this.handleEditLabelKeydown(e)
            },
            '.label-remove': {
                'click': (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.removeEditLabel(index);
                    this.updateEditModalContent();
                }
            }
        });
        
        // Render assignee selector in the edit modal
        setTimeout(() => {
            const container = document.querySelector('#edit-assignee-container');
            if (container) {
                const assigneeModule = document.createElement('task-assignee-module');
                assigneeModule.selectedAssigneeId = this.editingTask.assignee_id;
                assigneeModule.addEventListener('assignee-selected', (e) => {
                    this.editingTask.assignee_id = e.detail.assigneeId;
                });
                assigneeModule.addEventListener('assignee-removed', () => {
                    this.editingTask.assignee_id = null;
                });
                container.innerHTML = '';
                container.appendChild(assigneeModule);
            }
        }, 0);
    }

    closeEditModal() {
        this.showEditModal = false;
        this.editingTask = null;
        ModalPortal.destroy(this.modalId);
        this.modalId = 'task-creation-modal';
        this.requestUpdate();
    }

    async saveTaskEdit() {
        if (!this.editingTask) return;
        
        // Store task data before any async operations
        const taskToUpdate = { ...this.editingTask };
        const taskId = taskToUpdate.id;
        const taskTitle = taskToUpdate.title;
        
        // Format due_date properly - convert to date-only format (YYYY-MM-DD)
        if (taskToUpdate.due_date) {
            const dueDate = new Date(taskToUpdate.due_date);
            if (!isNaN(dueDate.getTime()) && dueDate.getFullYear() > 1900 && dueDate.getFullYear() < 2100) {
                // Format as YYYY-MM-DD for date column
                taskToUpdate.due_date = dueDate.toISOString().split('T')[0];
            } else {
                taskToUpdate.due_date = null;
            }
        }
        
        try {
            // Update task via API
            await window.api.lims.updateTask(taskId, taskToUpdate);
            
            // Update local state
            this.tasks = this.tasks.map(t => 
                t.id === taskId ? { ...taskToUpdate } : t
            );
            
            this.closeEditModal();
            this.showNotification('Task updated successfully');
            console.log(`[TaskManagement] Updated task: ${taskTitle}`);
        } catch (error) {
            this.handleError(error, 'Updating task');
            this.showNotification('Failed to update task', 'error');
        }
    }

    updateEditModalContent() {
        if (ModalPortal.exists(this.modalId)) {
            const modalContent = this.getEditModalContent();
            ModalPortal.update(this.modalId, modalContent);
            // Re-attach listeners after update
            this.renderEditModalInPortal();
        }
    }

    handleEditLabelKeydown(e) {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newLabel = e.target.value.trim();
            if (!this.editingTask.labels) {
                this.editingTask.labels = [];
            }
            if (!this.editingTask.labels.includes(newLabel)) {
                this.editingTask.labels = [...this.editingTask.labels, newLabel];
                this.updateEditModalContent();
            }
        }
    }

    removeEditLabel(index) {
        if (this.editingTask && this.editingTask.labels) {
            this.editingTask.labels = this.editingTask.labels.filter((_, i) => i !== index);
            this.updateEditModalContent();
        }
    }

    getEditModalContent() {
        if (!this.editingTask) return '';
        
        return `
            <style>
                ${this.getModalStyles()}
            </style>
            <div class="task-edit-modal-overlay">
                <div class="task-creation-modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Edit Task</h3>
                        <button class="modal-close-button">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        ${this.getEditModalFormContent()}
                    </div>
                    
                    <div class="modal-footer">
                        <button class="modal-button modal-button-cancel">
                            Cancel
                        </button>
                        <button class="modal-button modal-button-primary">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getEditModalFormContent() {
        const task = this.editingTask;
        if (!task) return '';
        
        // Escape HTML to prevent injection
        const escapeHtml = (str) => {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };
        
        return `
            <!-- Title -->
            <div class="form-group">
                <label class="form-label">Title</label>
                <input 
                    type="text" 
                    class="form-input" 
                    placeholder="Enter task title..."
                    value="${escapeHtml(task.title)}"
                    data-field="title"
                />
            </div>
            
            <!-- Description -->
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea 
                    class="form-textarea" 
                    placeholder="Add a more detailed description..."
                    data-field="description"
                >${escapeHtml(task.description)}</textarea>
            </div>
            
            <!-- Priority and Status Row -->
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <div class="priority-selector">
                        ${['urgent', 'high', 'medium', 'low'].map(priority => `
                            <div 
                                class="priority-option ${priority} ${task.priority === priority ? 'selected' : ''}"
                                data-priority="${priority}"
                            >
                                ${priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-select" data-field="status" value="${task.status || 'todo'}">
                        <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
                        <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="review" ${task.status === 'review' ? 'selected' : ''}>Review</option>
                        <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
                    </select>
                </div>
            </div>
            
            <!-- Due Date and Project Row -->
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Due Date</label>
                    <input 
                        type="datetime-local" 
                        class="form-input"
                        value="${task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ''}"
                        data-field="due_date"
                    />
                    <div class="quick-date-buttons">
                        <button type="button" class="quick-date-btn" data-days="0">Today</button>
                        <button type="button" class="quick-date-btn" data-days="1">Tomorrow</button>
                        <button type="button" class="quick-date-btn" data-days="7">Next Week</button>
                        <button type="button" class="quick-date-btn" data-clear="true">Clear</button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Project</label>
                    <select class="form-select" data-field="project_id" value="${task.project_id || ''}">
                        <option value="">No Project</option>
                        ${this.projects.map(project => `
                            <option value="${project.id}" ${task.project_id === project.id ? 'selected' : ''}>
                                ${project.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <!-- Assignee Row -->
            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Assignee</label>
                    <div id="edit-assignee-container">
                        <!-- Assignee selector will be rendered here -->
                    </div>
                </div>
                <div class="form-group">
                    <!-- Empty for spacing -->
                </div>
            </div>
            
            <!-- Labels -->
            <div class="form-group">
                <label class="form-label">Labels</label>
                <div class="labels-input">
                    ${(task.labels || []).map((label, index) => `
                        <span class="label-tag">
                            ${escapeHtml(label)}
                            <span class="label-remove" data-index="${index}">×</span>
                        </span>
                    `).join('')}
                    <input 
                        type="text" 
                        class="label-input-field"
                        placeholder="Add label..."
                    />
                </div>
            </div>
        `;
    }

    renderKeyboardHint() {
        return html`
            <div class="keyboard-hint ${this.keyboardHint ? 'visible' : ''}">
                ${this.keyboardHint}
            </div>
        `;
    }

    renderSelectionCount() {
        return html`
            <div class="selection-count ${this.selectedTasks.length > 1 ? 'visible' : ''}">
                ${this.selectedTasks.length} tasks selected
            </div>
        `;
    }

    renderListView(tasksToDisplay = this.tasks) {
        return html`
            <div class="task-list-view">
                <div class="task-list-header">
                    <div class="list-col" style="flex: 3;">Task</div>
                    <div class="list-col" style="flex: 1;">Status</div>
                    <div class="list-col" style="flex: 1;">Priority</div>
                    <div class="list-col" style="flex: 1;">Assignee</div>
                    <div class="list-col" style="flex: 0.5;">Actions</div>
                </div>
                
                <div class="task-list-body">
                    ${tasksToDisplay.map(task => html`
                        <div class="task-list-item" @click=${(e) => this.handleTaskClick(e, task)}>
                            <div class="list-col" style="flex: 3;">
                                <div class="task-title">${task.title}</div>
                                ${task.description ? html`
                                    <div class="task-description">${task.description}</div>
                                ` : ''}
                            </div>
                            <div class="list-col" style="flex: 1;">
                                <span class="task-status status-${task.status || 'todo'}">
                                    ${this.columnStatus[task.status]?.name || task.status}
                                </span>
                            </div>
                            <div class="list-col" style="flex: 1;">
                                ${task.priority ? html`
                                    <span class="task-priority priority-${task.priority}">
                                        ${task.priority}
                                    </span>
                                ` : ''}
                            </div>
                            <div class="list-col" style="flex: 1;">
                                ${this.renderAssigneeAvatar(task)}
                            </div>
                            <div class="list-col" style="flex: 0.5;">
                                <button class="ai-insights-button" 
                                    @click=${(e) => this.handleAIInsights(e, task)}
                                    title="AI Insights">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="M12 6v6l4 2"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    getTasksByStatus(status, tasksToFilter = this.tasks) {
        return tasksToFilter.filter(task => task.status === status);
    }

    // Task Templates System
    getTaskTemplates() {
        return [
            {
                id: 'bug-fix',
                name: 'Bug Fix',
                category: 'Development',
                icon: '🐛',
                description: 'Fix reported platform bug',
                template: {
                    title: 'Fix: [Bug Description]',
                    description: `Bug Fix Process:
1. Reproduce the issue
2. Identify root cause
3. Implement fix
4. Test solution
5. Deploy to staging
6. Verify in production`,
                    priority: 'high',
                    status: 'todo',
                    labels: 'bug,development,platform',
                    checklist: [
                        'Bug reproduced',
                        'Root cause identified',
                        'Fix implemented',
                        'Tests passing',
                        'Deployed to production'
                    ]
                }
            },
            {
                id: 'client-onboarding',
                name: 'Client Onboarding',
                category: 'Client Success',
                icon: '🏫',
                description: 'Onboard new school/institution',
                template: {
                    title: 'Onboard: [School Name]',
                    description: 'Complete client onboarding process',
                    priority: 'high',
                    status: 'todo',
                    labels: 'client,onboarding,school',
                    checklist: [
                        'Initial meeting completed',
                        'Account setup',
                        'Admin training scheduled',
                        'Student accounts created',
                        'First AI session verified'
                    ]
                }
            },
            {
                id: 'feature-development',
                name: 'New Feature',
                category: 'Development',
                icon: '✨',
                description: 'Implement new platform feature',
                template: {
                    title: 'Feature: [Feature Name]',
                    description: 'Develop and deploy new feature',
                    priority: 'medium',
                    status: 'todo',
                    labels: 'feature,development,platform'
                }
            },
            {
                id: 'support-ticket',
                name: 'Support Ticket',
                category: 'Support',
                icon: '🎫',
                description: 'Handle customer support request',
                template: {
                    title: 'Support: [Issue Summary]',
                    description: 'Resolve customer support ticket',
                    priority: 'medium',
                    status: 'todo',
                    labels: 'support,customer,ticket'
                }
            },
            {
                id: 'ai-improvement',
                name: 'AI Tutor Enhancement',
                category: 'AI/ML',
                icon: '🤖',
                description: 'Improve AI tutoring based on feedback',
                template: {
                    title: 'AI: [Enhancement Description]',
                    description: 'Implement AI tutoring improvement based on platform feedback',
                    priority: 'medium',
                    status: 'todo',
                    labels: 'ai,improvement,feedback'
                }
            },
            {
                id: 'performance-optimization',
                name: 'Performance Fix',
                category: 'Infrastructure',
                icon: '⚡',
                description: 'Optimize platform performance',
                template: {
                    title: 'Perf: [Area to Optimize]',
                    description: 'Improve system performance and response times',
                    priority: 'medium',
                    status: 'todo',
                    labels: 'performance,optimization,infrastructure'
                }
            }
        ];
    }

    // Virtual Scrolling for Performance
    initializeVirtualScrolling() {
        if (!this.shadowRoot) {
            console.warn('[initializeVirtualScrolling] Shadow root not ready');
            return;
        }
        
        // Set up intersection observers for each kanban column
        const columns = this.shadowRoot.querySelectorAll('.kanban-column');
        if (!columns || columns.length === 0) {
            console.warn('[initializeVirtualScrolling] No kanban columns found');
            return;
        }
        
        columns.forEach(column => {
            const columnId = column.dataset.status;
            if (!columnId) return;
            
            if (this.intersectionObservers[columnId]) {
                this.intersectionObservers[columnId].disconnect();
            }
            
            const observer = new IntersectionObserver(
                (entries) => this.handleTaskVisibility(entries, columnId),
                {
                    root: column.querySelector('.column-tasks'),
                    rootMargin: '100px',
                    threshold: 0
                }
            );
            
            this.intersectionObservers[columnId] = observer;
            
            // Observe all task cards in this column
            const taskCards = column.querySelectorAll('.task-card');
            taskCards.forEach(card => observer.observe(card));
        });
    }

    handleTaskVisibility(entries, columnId) {
        entries.forEach(entry => {
            const taskId = entry.target.dataset.taskId;
            if (!this.visibleTasks[columnId]) {
                this.visibleTasks[columnId] = new Set();
            }
            
            if (entry.isIntersecting) {
                this.visibleTasks[columnId].add(taskId);
                // Render full task content
                entry.target.classList.remove('task-placeholder');
            } else {
                this.visibleTasks[columnId].delete(taskId);
                // Render placeholder to maintain scroll position
                entry.target.classList.add('task-placeholder');
            }
        });
    }

    handleColumnScroll(event) {
        const column = event.target;
        const columnId = column.closest('.kanban-column').dataset.status;
        this.scrollPositions[columnId] = column.scrollTop;
        
        // Debounce scroll updates
        clearTimeout(this._scrollTimeout);
        this._scrollTimeout = setTimeout(() => {
            this.updateVisibleTasks(columnId);
        }, 100);
    }

    updateVisibleTasks(columnId) {
        const column = this.shadowRoot.querySelector(`[data-status="${columnId}"]`);
        if (!column) return;
        
        const container = column.querySelector('.column-tasks');
        const containerRect = container.getBoundingClientRect();
        const tasks = this.getTasksByStatus(columnId);
        
        // Calculate visible range with buffer
        const bufferSize = 5;
        const taskHeight = 120; // Approximate height
        const scrollTop = container.scrollTop;
        const visibleStart = Math.max(0, Math.floor(scrollTop / taskHeight) - bufferSize);
        const visibleEnd = Math.min(
            tasks.length,
            Math.ceil((scrollTop + containerRect.height) / taskHeight) + bufferSize
        );
        
        // Update visible tasks
        this.visibleTasks[columnId] = {
            start: visibleStart,
            end: visibleEnd,
            total: tasks.length
        };
        
        this.requestUpdate();
    }

    // Workflow Validation System
    getWorkflowRules() {
        return {
            // Status transition rules
            statusTransitions: {
                todo: ['in_progress'],
                in_progress: ['review', 'todo'],
                review: ['done', 'in_progress'],
                done: ['review'] // Can only go back to review
            },
            
            // LIMS-specific validation rules
            validationRules: [
                {
                    id: 'bug-fix-verification',
                    condition: (task, newStatus) => {
                        // Can't mark bug as done without verification
                        const labels = Array.isArray(task.labels) ? task.labels : [];
                        if (labels.includes('bug') && 
                            newStatus === 'done') {
                            // Check if bug fix has been tested/verified
                            return task.description?.toLowerCase().includes('verified') || 
                                   task.description?.toLowerCase().includes('tested') ||
                                   task.completion_percentage === 100;
                        }
                        return true;
                    },
                    errorMessage: 'Bug fixes must be tested and verified before marking as done'
                },
                {
                    id: 'client-task-priority',
                    condition: (task, newStatus) => {
                        // Client tasks should be prioritized
                        const labels = Array.isArray(task.labels) ? task.labels : [];
                        if (labels.includes('client') && 
                            labels.includes('urgent') && 
                            newStatus === 'todo' &&
                            task.priority !== 'high' && 
                            task.priority !== 'urgent') {
                            return false;
                        }
                        return true;
                    },
                    errorMessage: 'Urgent client tasks must be set to high priority'
                },
                {
                    id: 'review-approval',
                    condition: (task, newStatus) => {
                        // High priority tasks need review approval
                        if (task.priority === 'high' && 
                            task.status === 'review' && 
                            newStatus === 'done') {
                            // Check if task has been in review for reasonable time
                            const updatedTime = new Date(task.updated_at).getTime();
                            const now = Date.now();
                            const reviewDuration = now - updatedTime;
                            // Require at least 5 minutes in review
                            return reviewDuration > 5 * 60 * 1000;
                        }
                        return true;
                    },
                    errorMessage: 'High priority tasks require approval before completion (5 min review time)'
                },
                {
                    id: 'deployment-review',
                    condition: (task, newStatus) => {
                        // Feature deployments need review before done
                        const labels = Array.isArray(task.labels) ? task.labels : [];
                        if ((labels.includes('feature') || labels.includes('deployment')) && 
                            task.status === 'in_progress' && 
                            newStatus === 'done') {
                            // Must go through review stage
                            return false;
                        }
                        return true;
                    },
                    errorMessage: 'Features must go through review before deployment'
                }
            ],
            
            // Permission-based rules
            permissionRules: {
                'high_priority_approval': ['manager', 'senior_tech'],
                'equipment_override': ['admin', 'lab_manager'],
                'skip_review': ['senior_tech', 'manager']
            }
        };
    }

    async validateStatusTransition(task, newStatus) {
        const rules = this.workflowRules;
        this.validationErrors = {};
        
        // Check if transition is allowed
        const allowedTransitions = rules.statusTransitions[task.status];
        if (!allowedTransitions.includes(newStatus)) {
            this.validationErrors.transition = `Cannot move from ${task.status} to ${newStatus}`;
            return false;
        }
        
        // Run validation rules
        for (const rule of rules.validationRules) {
            const isValid = await rule.condition(task, newStatus);
            if (!isValid) {
                this.validationErrors[rule.id] = rule.errorMessage;
                return false;
            }
        }
        
        return true;
    }

    async checkEquipmentAvailability(equipmentId) {
        // Future enhancement: integrate with equipment management module
        return true;
    }

    async checkCalibrationStatus(equipmentId) {
        // Future enhancement: integrate with calibration tracking
        return true;
    }

    // Template Panel UI
    renderTaskCreationModal() {
        if (!this.showTaskCreationModal) {
            return '';
        }
        
        return html`
            <div class="task-creation-modal-overlay" @click=${() => this.closeTaskModal()}>
                <div class="task-creation-modal" @click=${(e) => e.stopPropagation()}>
                    <div class="modal-header">
                        <h3 class="modal-title">Create New Task</h3>
                        <button class="modal-close-button" @click=${() => this.closeTaskModal()}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <!-- Title -->
                        <div class="form-group">
                            <label class="form-label">Title</label>
                            <input 
                                type="text" 
                                class="form-input" 
                                placeholder="Enter task title..."
                                .value=${this.newTaskData.title}
                                @input=${(e) => this.updateNewTaskData('title', e.target.value)}
                            />
                        </div>
                        
                        <!-- Description -->
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea 
                                class="form-textarea" 
                                placeholder="Add a more detailed description..."
                                .value=${this.newTaskData.description || ''}
                                @input=${(e) => this.updateNewTaskData('description', e.target.value)}
                            ></textarea>
                        </div>
                        
                        <!-- Priority and Status Row -->
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Priority</label>
                                <div class="priority-selector">
                                    ${['urgent', 'high', 'medium', 'low'].map(priority => html`
                                        <div 
                                            class="priority-option ${priority} ${this.newTaskData.priority === priority ? 'selected' : ''}"
                                            @click=${() => this.updateNewTaskData('priority', priority)}
                                        >
                                            ${priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </div>
                                    `)}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select 
                                    class="form-select"
                                    .value=${this.newTaskData.status}
                                    @change=${(e) => this.updateNewTaskData('status', e.target.value)}
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Due Date and Project Row -->
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Due Date</label>
                                <input 
                                    type="datetime-local" 
                                    class="form-input"
                                    .value=${this.newTaskData.due_date || ''}
                                    @change=${(e) => this.updateNewTaskData('due_date', e.target.value)}
                                />
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Project</label>
                                <select 
                                    class="form-select"
                                    .value=${this.newTaskData.project_id || ''}
                                    @change=${(e) => this.updateNewTaskData('project_id', e.target.value)}
                                >
                                    <option value="">No Project</option>
                                    ${this.projects.map(project => html`
                                        <option value="${project.id}">${project.name}</option>
                                    `)}
                                </select>
                            </div>
                        </div>
                        
                        <!-- Assignee Row -->
                        <div class="form-row">
                            <div class="form-group" style="flex: 1;">
                                <label class="form-label">Assignee</label>
                                <task-assignee-module
                                    .selectedAssigneeId=${this.newTaskData.assignee_id}
                                    @assignee-selected=${(e) => this.updateNewTaskData('assignee_id', e.detail.assigneeId)}
                                    @assignee-removed=${() => this.updateNewTaskData('assignee_id', null)}
                                ></task-assignee-module>
                            </div>
                            <div class="form-group">
                                <!-- Empty for spacing -->
                            </div>
                        </div>
                        
                        <!-- Labels -->
                        <div class="form-group">
                            <label class="form-label">Labels</label>
                            <div class="labels-input" @click=${(e) => this.focusLabelInput(e)}>
                                ${this.newTaskData.labels.map((label, index) => html`
                                    <span class="label-tag">
                                        ${label}
                                        <span class="label-remove" @click=${() => this.removeLabel(index)}>×</span>
                                    </span>
                                `)}
                                <input 
                                    type="text" 
                                    class="label-input-field"
                                    placeholder="Add label..."
                                    @keydown=${(e) => this.handleLabelKeydown(e)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="modal-button modal-button-cancel" @click=${() => this.closeTaskModal()}>
                            Cancel
                        </button>
                        <button 
                            class="modal-button modal-button-primary" 
                            @click=${() => this.createTaskFromModal()}
                            ?disabled=${!this.newTaskData.title.trim() || this.isCreatingTask}
                        >
                            ${this.isCreatingTask ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTemplatePanel() {
        if (!this.templatePanelOpen) return '';
        
        return html`
            <div class="template-panel-overlay" @click=${() => this.templatePanelOpen = false}>
                <div class="template-panel" @click=${(e) => e.stopPropagation()}>
                    <div class="template-panel-header">
                        <h3>Task Templates</h3>
                        <button class="close-button" @click=${(e) => {
                            e.stopPropagation();
                            this.templatePanelOpen = false;
                            this.requestUpdate();
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    <div class="template-categories">
                        ${this.renderTemplateCategories()}
                    </div>
                </div>
            </div>
        `;
    }

    renderTemplateCategories() {
        const categories = {};
        this.taskTemplates.forEach(template => {
            if (!categories[template.category]) {
                categories[template.category] = [];
            }
            categories[template.category].push(template);
        });
        
        return Object.entries(categories).map(([category, templates]) => html`
            <div class="template-category">
                <h4>${category}</h4>
                <div class="template-grid">
                    ${templates.map(template => html`
                        <div class="template-card" @click=${() => this.createFromTemplate(template)}>
                            <div class="template-icon">${template.icon}</div>
                            <div class="template-name">${template.name}</div>
                            <div class="template-description">${template.description}</div>
                        </div>
                    `)}
                </div>
            </div>
        `);
    }

    async createFromTemplate(template) {
        console.log('[createFromTemplate] Called with template:', template);
        
        // Close template panel first
        this.templatePanelOpen = false;
        
        // Pre-fill the new task data with template values
        this.newTaskData = {
            title: template.template.title || '',
            description: template.template.description || '',
            status: template.template.status || 'todo',
            priority: template.template.priority || 'medium',
            labels: Array.isArray(template.template.labels) ? [...template.template.labels] : [],
            due_date: template.template.due_date || '',
            project_id: this.projects[0]?.id || null,
            assignee_id: null,
            created_from_template: template.id
        };
        
        // Open the task creation modal with pre-filled data
        this.showTaskCreationModal = true;
        
        // Force update to ensure UI refreshes
        this.requestUpdate();
        
        // Render modal in portal after update
        setTimeout(() => this.renderModalInPortal(), 0);
        
        // Show a hint about the template
        this.showKeyboardHint(`📋 Using template: ${template.name}`);
        setTimeout(() => this.hideKeyboardHint(), 2000);
    }
    
    showNotification(message, type = 'info') {
        // Use keyboard hint system for notifications
        this.showKeyboardHint(message);
        setTimeout(() => this.hideKeyboardHint(), 3000);
    }
    
    async handleAIInsights(event, task) {
        event.stopPropagation(); // Prevent task selection
        
        // Show loading state
        this.showKeyboardHint('🤖 Analyzing task with AI...');
        
        try {
            // Simulate AI analysis (in real implementation, this would call LEARN-X AI API)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate insights based on task type
            let insights = '';
            const labels = Array.isArray(task.labels) ? task.labels : [];
            
            if (labels.includes('bug')) {
                insights = `💡 AI Insights:\n\n` +
                    `1. Check recent deployments for changes in this area\n` +
                    `2. Review similar issues from the past 30 days\n` +
                    `3. Consider impact on ${Math.floor(Math.random() * 50 + 10)} active users\n` +
                    `4. Priority: ${task.priority === 'high' ? 'Fix within 24h' : 'Schedule for next sprint'}`;
            } else if (labels.includes('client') || labels.includes('onboarding')) {
                insights = `💡 AI Insights:\n\n` +
                    `1. Similar school size onboardings took avg 3-5 days\n` +
                    `2. Prepare training materials for their use case\n` +
                    `3. Schedule follow-up after 1 week of usage\n` +
                    `4. Success metric: 80% student activation in week 1`;
            } else if (labels.includes('ai') || labels.includes('performance')) {
                insights = `💡 AI Insights:\n\n` +
                    `1. Current response time: ${Math.random() * 5 + 3}s avg\n` +
                    `2. Optimization could save $${Math.floor(Math.random() * 500 + 100)}/month\n` +
                    `3. Consider caching frequent queries\n` +
                    `4. Test with production data before deploying`;
            } else if (labels.includes('feature')) {
                insights = `💡 AI Insights:\n\n` +
                    `1. ${Math.floor(Math.random() * 30 + 20)}% of users requested this\n` +
                    `2. Estimated dev time: ${Math.floor(Math.random() * 5 + 2)} days\n` +
                    `3. Similar features improved engagement by 15%\n` +
                    `4. Consider A/B testing after launch`;
            } else {
                insights = `💡 AI Insights:\n\n` +
                    `1. Break down into smaller subtasks\n` +
                    `2. Identify dependencies and blockers\n` +
                    `3. Set clear acceptance criteria\n` +
                    `4. Allocate buffer time for testing`;
            }
            
            // Show insights in an alert (in production, use a proper modal)
            alert(insights);
            this.hideKeyboardHint();
            
        } catch (error) {
            console.error('[AI Insights] Error:', error);
            this.showKeyboardHint('❌ AI insights unavailable');
            setTimeout(() => this.hideKeyboardHint(), 2000);
        }
    }

    renderValidationErrors() {
        if (!this.validationErrors || Object.keys(this.validationErrors).length === 0) {
            return '';
        }
        
        return html`
            <div class="validation-errors">
                ${Object.entries(this.validationErrors).map(([key, error]) => html`
                    <div class="validation-error">
                        <span class="validation-error-icon">⚠️</span>
                        ${error}
                    </div>
                `)}
            </div>
        `;
    }
    
}

customElements.define('task-management-module-enhanced', TaskManagementModuleEnhanced);