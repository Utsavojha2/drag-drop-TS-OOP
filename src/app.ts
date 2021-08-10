import { ProjectItem, icons } from './helpers.js';

class ProjectList {
    private readonly listContainer: HTMLElement;
    protected activeList: HTMLUListElement;
    protected inactiveList: HTMLUListElement;
    protected list: NodeListOf<HTMLUListElement>;

    constructor(){       
        this.listContainer = document.querySelector('.list__sec')! as HTMLElement;
        this.list = this.listContainer.querySelectorAll('.list__section > .ul')!;
        this.activeList = this.listContainer.querySelector('.list__section > .active-list')! as HTMLUListElement;
        this.inactiveList = this.listContainer.querySelector('.list__section > .inactive-list')! as HTMLUListElement;
    }

    protected emptyListDOM(){
        this.list.forEach(listItem =>{
            listItem.innerHTML = '';
        })
    }

    protected arrangePin(){
        this.list.forEach((listItem) => {
            const firstItem = listItem.children[0];
            if(firstItem){
                firstItem.className = 'hide__img';
            }
        })
    }
}


class ProjectInput extends ProjectList{
    private inputSec: HTMLElement;
    private inputSection: HTMLDivElement;
    protected submitBtn: HTMLInputElement;
    protected cancelBtn: HTMLButtonElement;
    private readonly projectName: HTMLInputElement;
    private readonly projectState: HTMLSelectElement;
    protected totalProjects: Array<ProjectItem>;
    protected startIndex: number | null;

    constructor(){
        super();
        this.inputSec = document.querySelector('.input__sec')! as HTMLElement;
        this.inputSection = this.inputSec.querySelector('.input__section')! as HTMLDivElement;

        this.projectName = this.inputSection.querySelector('input')! as HTMLInputElement;
        this.projectState = document.querySelector('#state')! as HTMLSelectElement;
        this.submitBtn = this.inputSec.querySelector('div > #btn')! as HTMLInputElement;
        this.cancelBtn = this.inputSec.querySelector('div  > #cancel__btn')! as HTMLButtonElement;

        this.totalProjects = [];
        this.startIndex = null;
        this.formSubmit();
        this.crudFunctions();
    }

    private addProjectItem = () => {
        const getBtnAttr = this.submitBtn.getAttribute('data-attr');
        if(getBtnAttr !== 'submit') return;
        const projTitle = this.projectName.value;
        const projState = this.projectState.value;
        if(!projTitle){
            return;
        }
        this.totalProjects.push({
            title: projTitle,
            isActive: projState === 'true'
        })
        this.projectName.value = '';
        this.showOnDOM();
    }

    appendDraggedItem(el: HTMLLIElement, dropIndex: number){
        const lastIndex = this.totalProjects.length - 1;
        this.totalProjects = this.totalProjects.map((project, index) => {
            if(index !== this.startIndex){
                return project;
            }
            return {
                title: project.title,
                isActive: !project.isActive
            }
        })
        this.showOnDOM()
    }

    onDragStart = (e: Event) => {
        const startIndex = +(e?.currentTarget! as HTMLLIElement).getAttribute('data-index')! - 1;
        this.startIndex = startIndex;
    }

    onDragOver(e: Event){
        e.preventDefault()
    }

    onDrop = (e: Event) => {
        const element = e.currentTarget as HTMLLIElement;
        const dropIndex = +element.getAttribute('data-index')! - 1;

        const replacingItem = this.totalProjects[this.startIndex!];
        const replacedItem = this.totalProjects[dropIndex];
        if(this.totalProjects[dropIndex].isActive !== this.totalProjects[this.startIndex!].isActive){
            this.appendDraggedItem(element, dropIndex)
            return;
        }
        this.totalProjects.splice(dropIndex, 1, replacingItem);
        this.totalProjects.splice(this.startIndex!, 1, replacedItem);
        this.showOnDOM();
    };

    onDragEnter = (e: Event) => {
        e.preventDefault();
    }

    private showOnDOM = (): void => {
        const onHidePin = this.totalProjects.length >= 2;
        this.emptyListDOM();
        this.totalProjects.forEach((project, index) => {
            const uid = index + 1;
            const listItem = document.createElement('li');
            listItem.id = project?.isActive ? 'item active__item' : 'item inactive__item';
            listItem.setAttribute('data-index', uid + '');
            listItem.setAttribute('draggable', "true");
            listItem.ondragstart= this.onDragStart;
            listItem.ondragover = this.onDragOver;
            listItem.ondragenter = this.onDragEnter;
            listItem.ondrop = this.onDrop;
            listItem.innerHTML = `
                <img class="img edit" src=${icons.edit}/>
                <p class=${project?.isActive ? 'active__text' : 'inactive__text'}>${project?.title}</p>
                <img class="img close" src=${icons.close} />
                ${onHidePin ? `<img class="img pin" title="Pin Item" src=${icons.pin} />` : ''}
            `;
            if(project?.isActive){
                this.activeList.append(listItem);
                return;
            }
            this.inactiveList.append(listItem)
        })
        this.arrangePin()

    }

    getProjectItem(e: Event){
        const elementId = +(e?.target as HTMLImageElement).parentElement?.getAttribute('data-index')!;
        const projectClassification = this.totalProjects.findIndex((el, index) => {
            return index + 1 === elementId;
        })
        return projectClassification;
    }

    manipulateButton(style: string, attr: string, value: string){
        this.projectName.value = '';
        this.cancelBtn.style.display = style;
        this.submitBtn.value = value;
        this.submitBtn.setAttribute('data-attr', attr)
        if(attr === 'edit'){
            this.projectName.focus()
        }
    }

    editListItem = (e: Event) => {
        const currentIdx = this.getProjectItem(e);
        this.manipulateButton('inline-block', 'edit', 'Edit Item');
        this.cancelBtn.onclick = () => this.manipulateButton('none', 'submit', 'Submit');
        this.projectName.value = this.totalProjects[currentIdx].title;
        this.submitBtn.onclick = () => {
            if(!this.projectName.value) return;
            this.concludeEditing(currentIdx);
        }
    }

    concludeEditing(i: Number){
        const editedProjectList = this.totalProjects.map((el, index) => {
            if(index === i){
                return {
                    title: this.projectName.value,
                    isActive: this.projectState.value === 'true'
                }
            }
            return el;
        })
        this.totalProjects = editedProjectList;
        this.manipulateButton('none', 'submit', 'Submit');
        this.showOnDOM();
    }

    pinListItem = (e: Event) => {
        const index = this.getProjectItem(e);
        const replacedItem = this.totalProjects[0];
        const replacingItem = this.totalProjects[index];
        this.totalProjects[0] = replacingItem;
        this.totalProjects[index] = replacedItem;
        this.showOnDOM()
    }

    deleteListItem = (e: Event): void => {
        const index = this.getProjectItem(e);
        this.totalProjects.splice(index, 1);
        this.showOnDOM();
    }

    onIconClick = (e: Event): void => {
        const imgClasses = (e?.target! as HTMLImageElement).className;
        switch(imgClasses){
            case 'img edit':
                this.editListItem(e);
                break;
            case 'img pin':
                this.pinListItem(e);
                break;
            case 'img close':
                this.deleteListItem(e);
                break;
        }
    }

    private formSubmit(): void{
        this.submitBtn.addEventListener('click', this.addProjectItem);
    }

    private crudFunctions(): void{
        this.list.forEach((li) => {
            li.addEventListener('click', (e? : Event) => {
                if((e?.target! as HTMLLIElement).classList.contains('img')){
                    this.onIconClick(e!);
                }
            })    
        })
    }
}

const outProject = new ProjectInput();