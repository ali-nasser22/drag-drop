import {Draggable} from '../models/drag-drop.js';
import {Component} from "./base-component.js";
import {Project} from "../models/project.js";
import {AutoBind} from "../decorators/auto-bind.js";

// Project Item Class
   export class ProjectItem extends Component<HTMLUListElement,HTMLLIElement> implements Draggable{
        private project:Project;
        constructor(hostId:string,project:Project) {
            super('single-project',hostId,false,project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
        configure() {
            this.element.addEventListener('dragstart',this.dragStartHandler);
            this.element.addEventListener('dragend',this.dragEndHandler);
        };
        renderContent() {
            this.element.querySelector('h2')!.textContent = this.project.title;
            this.element.querySelector('h3')!.textContent =`Number of contributors: ${this.project.people.toString()}`;
            this.element.querySelector('p')!.textContent = this.project.description;
        };
        @AutoBind
        dragStartHandler(event: DragEvent) {
            event.dataTransfer!.setData('text/plain',this.project.id);
            event.dataTransfer!.effectAllowed='move';
        }
        @AutoBind
        dragEndHandler(event: DragEvent) {


        }
    }
