var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("components/base-component", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Component = void 0;
    // Component Base Class
    class Component {
        constructor(templateId, hostElementId, insertAtStart, newElementId) {
            this.templateElement = document.getElementById(templateId);
            this.hostElement = document.getElementById(hostElementId);
            const importedNodes = document.importNode(this.templateElement.content, true);
            this.element = importedNodes.firstElementChild;
            if (newElementId) {
                this.element.id = newElementId;
            }
            this.attach(insertAtStart);
        }
        attach(insertAtStart) {
            this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
        }
    }
    exports.Component = Component;
});
define("util/validation", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validate = validate;
    function validate(validatableInput) {
        let isValid = true;
        if (validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        }
        if (validatableInput.minLength != null &&
            typeof validatableInput.value === 'string') {
            isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
        }
        if (validatableInput.maxLength != null &&
            typeof validatableInput.value === 'string') {
            isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
        }
        if (validatableInput.min != null &&
            typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value >= validatableInput.min;
        }
        if (validatableInput.max != null &&
            typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value <= validatableInput.max;
        }
        return isValid;
    }
});
define("decorators/auto-bind", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoBind = AutoBind;
    // AutoBind Decorator
    function AutoBind(_, _2, descriptor) {
        const originalMethod = descriptor.value;
        return {
            configurable: true,
            enumerable: false,
            get() {
                return originalMethod.bind(this);
            },
        };
    }
});
define("models/project", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Project = exports.ProjectStatus = void 0;
    // Project Type
    var ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["active"] = 0] = "active";
        ProjectStatus[ProjectStatus["finished"] = 1] = "finished";
    })(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
    // Project Class
    class Project {
        constructor(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    exports.Project = Project;
});
define("state/project-state", ["require", "exports", "models/project"], function (require, exports, project_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.projectState = exports.ProjectState = void 0;
    class State {
        constructor() {
            this.listeners = [];
        }
        addListener(listenerFn) {
            this.listeners.push(listenerFn);
        }
    }
    class ProjectState extends State {
        constructor() {
            super();
            this.projects = [];
        }
        static getInstance() {
            if (!this.instance) {
                this.instance = new ProjectState();
            }
            return this.instance;
        }
        addProject(title, description, numOfPeople) {
            const newProject = new project_1.Project(Math.random().toString(), title, description, numOfPeople, project_1.ProjectStatus.active);
            this.projects.push(newProject);
            this.updateListeners();
        }
        moveProject(projectId, newStatus) {
            const project = this.projects.find(prj => prj.id === projectId);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListeners();
            }
        }
        updateListeners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice());
            }
        }
    }
    exports.ProjectState = ProjectState;
    exports.projectState = ProjectState.getInstance();
});
define("components/project-input", ["require", "exports", "components/base-component", "util/validation", "decorators/auto-bind", "state/project-state"], function (require, exports, base_component_1, validation_1, auto_bind_1, project_state_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectInput = void 0;
    // Project Input Class
    class ProjectInput extends base_component_1.Component {
        constructor() {
            super('project-input', 'app', true, 'user-input');
            this.titleInputElement = this.element.querySelector('#title');
            this.descriptionInputElement = this.element.querySelector('#description');
            this.peopleInputElement = this.element.querySelector('#people');
            this.configure();
        }
        gatherUserInput() {
            const enteredTitle = this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;
            const enteredPeople = this.peopleInputElement.value;
            const titleValidatable = { value: enteredTitle, required: true, minLength: 6 };
            const descriptionValidatable = { value: enteredDescription, required: true, minLength: 5 };
            const peopleValidatable = { value: +enteredPeople, required: true, min: 1 };
            if (!(0, validation_1.validate)(titleValidatable) || !(0, validation_1.validate)(descriptionValidatable) || !(0, validation_1.validate)(peopleValidatable)) {
                alert('Invalid input, please try again');
                return;
            }
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
        clearInputs() {
            this.titleInputElement.value = '';
            this.descriptionInputElement.value = '';
            this.peopleInputElement.value = '';
        }
        submitHandler(event) {
            event.preventDefault();
            const userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                const [title, description, people] = userInput;
                project_state_1.projectState.addProject(title, description, people);
                this.clearInputs();
            }
        }
        configure() {
            this.element.addEventListener('submit', this.submitHandler);
        }
        renderContent() { }
    }
    exports.ProjectInput = ProjectInput;
    __decorate([
        auto_bind_1.AutoBind
    ], ProjectInput.prototype, "submitHandler", null);
});
define("models/drag-drop", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("components/project-item", ["require", "exports", "components/base-component", "decorators/auto-bind"], function (require, exports, base_component_2, auto_bind_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectItem = void 0;
    // Project Item Class
    class ProjectItem extends base_component_2.Component {
        constructor(hostId, project) {
            super('single-project', hostId, false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
        configure() {
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);
        }
        ;
        renderContent() {
            this.element.querySelector('h2').textContent = this.project.title;
            this.element.querySelector('h3').textContent = `Number of contributors: ${this.project.people.toString()}`;
            this.element.querySelector('p').textContent = this.project.description;
        }
        ;
        dragStartHandler(event) {
            event.dataTransfer.setData('text/plain', this.project.id);
            event.dataTransfer.effectAllowed = 'move';
        }
        dragEndHandler(event) {
        }
    }
    exports.ProjectItem = ProjectItem;
    __decorate([
        auto_bind_2.AutoBind
    ], ProjectItem.prototype, "dragStartHandler", null);
    __decorate([
        auto_bind_2.AutoBind
    ], ProjectItem.prototype, "dragEndHandler", null);
});
define("components/project-list", ["require", "exports", "components/base-component", "decorators/auto-bind", "models/project", "components/project-item", "state/project-state"], function (require, exports, base_component_3, auto_bind_3, project_2, project_item_1, project_state_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectList = void 0;
    // Project List Class
    class ProjectList extends base_component_3.Component {
        constructor(type) {
            super('project-list', 'app', false, `${type}-projects`);
            this.type = type;
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
        renderProjects() {
            const listEl = document.getElementById(`${this.type}-projects-list`);
            listEl.innerHTML = '';
            for (const project of this.assignedProjects) {
                new project_item_1.ProjectItem(this.element.querySelector('ul').id, project);
            }
        }
        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            this.element.addEventListener('drop', this.dropHandler);
            project_state_2.projectState.addListener((projects) => {
                this.assignedProjects = projects.filter(prj => prj.status === (this.type === 'active' ? project_2.ProjectStatus.active : project_2.ProjectStatus.finished));
                this.renderProjects();
            });
        }
        renderContent() {
            this.element.querySelector('ul').id = `${this.type}-projects-list`;
            this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' PROJECTS';
        }
        dragOverHandler(event) {
            if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                const listEl = this.element.querySelector('ul');
                listEl.classList.add('droppable');
            }
        }
        dropHandler(event) {
            const prjId = event.dataTransfer.getData('text/plain');
            project_state_2.projectState.moveProject(prjId, this.type === 'active' ? project_2.ProjectStatus.active : project_2.ProjectStatus.finished);
        }
        dragLeaveHandler(event) {
            const listEl = this.element.querySelector('ul');
            listEl.classList.remove('droppable');
        }
    }
    exports.ProjectList = ProjectList;
    __decorate([
        auto_bind_3.AutoBind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        auto_bind_3.AutoBind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        auto_bind_3.AutoBind
    ], ProjectList.prototype, "dragLeaveHandler", null);
});
define("script", ["require", "exports", "components/project-input", "components/project-list"], function (require, exports, project_input_1, project_list_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    new project_input_1.ProjectInput();
    new project_list_1.ProjectList('active');
    new project_list_1.ProjectList('finished');
});
