import { icons } from './helpers.js';
class ProjectList {
    constructor() {
        this.listContainer = document.querySelector('.list__sec');
        this.list = this.listContainer.querySelectorAll('.list__section > .ul');
        this.activeList = this.listContainer.querySelector('.list__section > .active-list');
        this.inactiveList = this.listContainer.querySelector('.list__section > .inactive-list');
    }
    emptyListDOM() {
        this.list.forEach(listItem => {
            listItem.innerHTML = '';
        });
    }
    arrangePin() {
        this.list.forEach((listItem) => {
            const firstItem = listItem.children[0];
            if (firstItem) {
                firstItem.className = 'hide__img';
            }
        });
    }
}
class ProjectInput extends ProjectList {
    constructor() {
        super();
        this.addProjectItem = () => {
            const getBtnAttr = this.submitBtn.getAttribute('data-attr');
            if (getBtnAttr !== 'submit')
                return;
            const projTitle = this.projectName.value;
            const projState = this.projectState.value;
            if (!projTitle) {
                return;
            }
            this.totalProjects.push({
                title: projTitle,
                isActive: projState === 'true'
            });
            this.projectName.value = '';
            this.showOnDOM();
        };
        this.onDragStart = (e) => {
            const startIndex = +(e === null || e === void 0 ? void 0 : e.currentTarget).getAttribute('data-index') - 1;
            this.startIndex = startIndex;
        };
        this.onDrop = (e) => {
            const element = e.currentTarget;
            const dropIndex = +element.getAttribute('data-index') - 1;
            const replacingItem = this.totalProjects[this.startIndex];
            const replacedItem = this.totalProjects[dropIndex];
            if (this.totalProjects[dropIndex].isActive !== this.totalProjects[this.startIndex].isActive) {
                this.appendDraggedItem(element, dropIndex);
                return;
            }
            this.totalProjects.splice(dropIndex, 1, replacingItem);
            this.totalProjects.splice(this.startIndex, 1, replacedItem);
            this.showOnDOM();
        };
        this.onDragEnter = (e) => {
            e.preventDefault();
        };
        this.showOnDOM = () => {
            const onHidePin = this.totalProjects.length >= 2;
            this.emptyListDOM();
            this.totalProjects.forEach((project, index) => {
                const uid = index + 1;
                const listItem = document.createElement('li');
                listItem.id = (project === null || project === void 0 ? void 0 : project.isActive) ? 'item active__item' : 'item inactive__item';
                listItem.setAttribute('data-index', uid + '');
                listItem.setAttribute('draggable', "true");
                listItem.ondragstart = this.onDragStart;
                listItem.ondragover = this.onDragOver;
                listItem.ondragenter = this.onDragEnter;
                listItem.ondrop = this.onDrop;
                listItem.innerHTML = `
                <img class="img edit" src=${icons.edit}/>
                <p class=${(project === null || project === void 0 ? void 0 : project.isActive) ? 'active__text' : 'inactive__text'}>${project === null || project === void 0 ? void 0 : project.title}</p>
                <img class="img close" src=${icons.close} />
                ${onHidePin ? `<img class="img pin" title="Pin Item" src=${icons.pin} />` : ''}
            `;
                if (project === null || project === void 0 ? void 0 : project.isActive) {
                    this.activeList.append(listItem);
                    return;
                }
                this.inactiveList.append(listItem);
            });
            this.arrangePin();
        };
        this.editListItem = (e) => {
            const currentIdx = this.getProjectItem(e);
            this.manipulateButton('inline-block', 'edit', 'Edit Item');
            this.cancelBtn.onclick = () => this.manipulateButton('none', 'submit', 'Submit');
            this.projectName.value = this.totalProjects[currentIdx].title;
            this.submitBtn.onclick = () => {
                if (!this.projectName.value)
                    return;
                this.concludeEditing(currentIdx);
            };
        };
        this.pinListItem = (e) => {
            const index = this.getProjectItem(e);
            const replacedItem = this.totalProjects[0];
            const replacingItem = this.totalProjects[index];
            this.totalProjects[0] = replacingItem;
            this.totalProjects[index] = replacedItem;
            this.showOnDOM();
        };
        this.deleteListItem = (e) => {
            const index = this.getProjectItem(e);
            this.totalProjects.splice(index, 1);
            this.showOnDOM();
        };
        this.onIconClick = (e) => {
            const imgClasses = (e === null || e === void 0 ? void 0 : e.target).className;
            switch (imgClasses) {
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
        };
        this.inputSec = document.querySelector('.input__sec');
        this.inputSection = this.inputSec.querySelector('.input__section');
        this.projectName = this.inputSection.querySelector('input');
        this.projectState = document.querySelector('#state');
        this.submitBtn = this.inputSec.querySelector('div > #btn');
        this.cancelBtn = this.inputSec.querySelector('div  > #cancel__btn');
        this.totalProjects = [];
        this.startIndex = null;
        this.formSubmit();
        this.crudFunctions();
    }
    appendDraggedItem(el, dropIndex) {
        const lastIndex = this.totalProjects.length - 1;
        this.totalProjects = this.totalProjects.map((project, index) => {
            if (index !== this.startIndex) {
                return project;
            }
            return {
                title: project.title,
                isActive: !project.isActive
            };
        });
        this.showOnDOM();
    }
    onDragOver(e) {
        e.preventDefault();
    }
    getProjectItem(e) {
        var _a;
        const elementId = +((_a = (e === null || e === void 0 ? void 0 : e.target).parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute('data-index'));
        const projectClassification = this.totalProjects.findIndex((el, index) => {
            return index + 1 === elementId;
        });
        return projectClassification;
    }
    manipulateButton(style, attr, value) {
        this.projectName.value = '';
        this.cancelBtn.style.display = style;
        this.submitBtn.value = value;
        this.submitBtn.setAttribute('data-attr', attr);
        if (attr === 'edit') {
            this.projectName.focus();
        }
    }
    concludeEditing(i) {
        const editedProjectList = this.totalProjects.map((el, index) => {
            if (index === i) {
                return {
                    title: this.projectName.value,
                    isActive: this.projectState.value === 'true'
                };
            }
            return el;
        });
        this.totalProjects = editedProjectList;
        this.manipulateButton('none', 'submit', 'Submit');
        this.showOnDOM();
    }
    formSubmit() {
        this.submitBtn.addEventListener('click', this.addProjectItem);
    }
    crudFunctions() {
        this.list.forEach((li) => {
            li.addEventListener('click', (e) => {
                if ((e === null || e === void 0 ? void 0 : e.target).classList.contains('img')) {
                    this.onIconClick(e);
                }
            });
        });
    }
}
const outProject = new ProjectInput();
