// Project Type
enum ProjectStatus {active,finished}
class Project{
    constructor(public id:string,public title:string,public description:string,public people:number,public status: ProjectStatus) {

    }
}
//project State Management
type Listener = (items:Project[]) => void ;


class ProjectState{
    private listeners: Listener[] =[];
    private projects: Project[] = [];
    private static instance:ProjectState;
    private constructor() {
    }

    addProject(title: string, description: string,numOfPeople:number){
        const newProject = new Project(Math.random().toString(),title,description,numOfPeople,ProjectStatus.active);
        this.projects = [...this.projects,newProject];
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addListener(listenerFn:Listener){
        this.listeners = [...this.listeners,listenerFn];
    }


}

const projectState = ProjectState.getInstance();


// autoBind decorator
function AutoBind(_:any,_2:string,descriptor:PropertyDescriptor){
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjustedDescriptor;
}
// validation Logic
interface Validatable{
    value:string | number;
    required?:boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}
function validate(validatableInput:Validatable){
    let isValid = true;
    if(validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if(validatableInput.minLength != null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length > validatableInput.minLength;
    }
    if(validatableInput.maxLength != null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
    }
    if(validatableInput.min != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value > validatableInput.min;
    }
    if(validatableInput.max != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value < validatableInput.max;
    }
    return isValid;
}





class ProjectList{
    templateElement:HTMLTemplateElement;
    hostElement:HTMLDivElement;
    element:HTMLElement;
    assignedProjects:Project[];
    constructor(private type:'active' | 'finished') {
        this.templateElement = document.querySelector('#project-list') as HTMLTemplateElement;
        this.hostElement = document.querySelector('#app') as HTMLDivElement;
        this.assignedProjects = [];

        const importedNodes = document.importNode(this.templateElement.content,true);
        this.element = importedNodes.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects:Project[])=>{
            this.assignedProjects = projects;
            this.renderProjects();
        });


        this.attach();
        this.renderContent();
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        for (const project of this.assignedProjects){
            const listItem = document.createElement('li');
            listItem.textContent = project.title;
            listEl.appendChild(listItem);
        }

    }


    private renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }
    private attach(){
        this.hostElement.insertAdjacentElement('beforeend',this.element);
    }
}
class ProjectInput{
    templateElement:HTMLTemplateElement;
    hostElement:HTMLDivElement;
    element:HTMLFormElement;
    titleInputElement:HTMLInputElement;
    descriptionInputElement:HTMLInputElement;
    peopleInputElement:HTMLInputElement;

    constructor() {
        this.templateElement = document.querySelector('#project-input') as HTMLTemplateElement;
        this.hostElement = document.querySelector('#app') as HTMLDivElement;

        const importedNodes = document.importNode(this.templateElement.content, true);
        this.element = importedNodes.firstElementChild as HTMLFormElement;
        this.element.id ='user-input';

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;



        this.configure();
        this.attach();
    }
    private gatherUserInput():[string,string,number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable:Validatable={
            value:enteredTitle,
            required:true,
            minLength:6
        }

        const descriptionValidatable:Validatable={
            value:enteredDescription,
            required:true,
            minLength:5
        }

        const peopleValidatable:Validatable={
            value:+enteredPeople,
            required:true,
            min:1
        }

        if(!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
            alert('invalid input, please try again');
            return;
        }
        return [enteredTitle,enteredDescription,+enteredPeople];

    }
    private clearInputs(){
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    @AutoBind
    private submitHandler(event:Event){
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)){
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }

    }
    private configure(){
        this.element.addEventListener('submit',this.submitHandler);
    }
    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin',this.element);
    }
}


const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');