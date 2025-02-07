import {Component} from "./base-component";
import {AutoBind} from "../decorators/auto-bind";
import {DragTarget} from "../models/drag-drop";
import {Project, ProjectStatus} from "../models/project";
import {ProjectItem} from "./project-item";
import {projectState} from "../state/project-state";


// Project List Class
    export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
        assignedProjects: Project[];

        constructor(private type: 'active' | 'finished') {
            super('project-list', 'app', false, `${type}-projects`);
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }

        private renderProjects() {
            const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
            listEl.innerHTML = '';
            for (const project of this.assignedProjects) {
                new ProjectItem(this.element.querySelector('ul')!.id,project);
            }
        }

        configure() {
            this.element.addEventListener('dragover',this.dragOverHandler);
            this.element.addEventListener('dragleave',this.dragLeaveHandler);
            this.element.addEventListener('drop',this.dropHandler);
            projectState.addListener((projects: Project[]) => {
                this.assignedProjects = projects.filter(prj => prj.status === (this.type === 'active' ? ProjectStatus.active : ProjectStatus.finished));
                this.renderProjects();
            });
        }

        renderContent() {
            this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
            this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
        }
        @AutoBind
        dragOverHandler(event: DragEvent) {
            if(event.dataTransfer && event.dataTransfer.types[0] ==='text/plain'){
                event.preventDefault();
                const listEl =this.element.querySelector('ul')!;
                listEl.classList.add('droppable');
            }
        }
        @AutoBind
        dropHandler(event: DragEvent) {
            const prjId = event.dataTransfer!.getData('text/plain');
            projectState.moveProject(prjId,this.type === 'active' ? ProjectStatus.active : ProjectStatus.finished);
        }
        @AutoBind
        dragLeaveHandler(event: DragEvent) {
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.remove('droppable');

        }
    }
