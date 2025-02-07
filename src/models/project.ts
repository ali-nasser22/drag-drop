
// Project Type
   export enum ProjectStatus { active, finished }

// Project Class
    export class Project {
        constructor(
            public id: string,
            public title: string,
            public description: string,
            public people: number,
            public status: ProjectStatus
        ) {}
    }
