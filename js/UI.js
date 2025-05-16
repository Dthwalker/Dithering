export default class UI {

    constructor(nav) {
        if (nav) this.createInputs(nav);
    }

    createButton(inner, callback) {
        let btn = document.createElement('button');
        btn.onclick = callback;
        return btn;
    }

    createFile({name, inner, callback}) {
        let block = document.createElement('div');
        block.className = 'settings_p';
        block.innerHTML = `
         <div class="settings_dscr">
            <div class="settings_name">${name}</div>
         </div>
         <label class="settings_file">
             <input type="file">
             Choise file
         </label>
        `;
        block.querySelector('input').onchange = callback;
        return block;
    }

    createSelect({name, options, callback, selected}) {

        let block = document.createElement('div');
        block.className = 'settings_p';
        block.innerHTML = `
            <div class="settings_dscr">
                <div class="settings_name">${name}</div>
            </div>
        `;

        let slct = document.createElement('select');
        block.append(slct);

        if (Array.isArray(options)) {
            options.forEach((e, i) => {
                slct.innerHTML += `<option value="${e}" ${selected == e ? 'selected' : ''}>${e}</option>`
            });
        } else {
            Object.keys(options).forEach(group => {
                slct.innerHTML += `<optgroup label="${group}">`;
                options[group].forEach((e, i) => {
                    slct.innerHTML += `<option value="${e}" ${selected == e ? 'selected' : ''}>${e}</option>`
                });
                slct.innerHTML += `</optgroup>`;
            })
        }

        slct.onchange = callback;
        return block;
    }

    createRange({name, min, max, step, value, callback}) {
        let block = document.createElement('div');
        block.className = 'settings_p';
        block.innerHTML = `
                <div class="settings_dscr">
                    <div class="settings_name">${name}</div>
                    <div class="settings_val">${value}</div>
                </div>
                <input type="range"
                    min="${min}"
                    max="${max}"
                    step="${step}"
                    value="${value}"
                 >`;
        block.querySelector('input').oninput = e => {
            let val = + e.target.value;
            block.querySelector('.settings_val').innerHTML = val;
            callback(e);
        }
        return block;
    }

    createNumber({name, min, max, step, value, callback}) {
        let block = document.createElement('div');
        block.className = 'settings_p';
        block.innerHTML = `
                <div class="settings_dscr">
                    <div class="settings_name">${name}</div>
                </div>
                <input type="number"
                    min="${min}"
                    max="${max}"
                    step="${step}"
                    value="${value}"
                 >`;
        block.querySelector('input').oninput = callback;
        
        return block;
    }

    createToggle({names, state, callback}) {
        let block = document.createElement('div');
        block.className = 'settings_p';
        let btn = document.createElement('button');
        btn.innerHTML = names[state ? 1: 0];
        btn.className = 'settings_toggle' + (state ? ' active' : '');
        block.append(btn)
        btn.onclick = (e) => {
            state = !state;
            btn.classList.toggle('active');
            btn.innerHTML = names[state ? 1: 0];
            callback(e);
        };
        
        return block;
    }


    createInputs(nav, space) {
        if (!space) space = document.querySelector('.setting');
        nav.forEach(e => {
            switch (e.type) {
                case 'number' : space.append(this.createNumber(e)); break;
                case 'range'  : space.append(this.createRange(e)); break;
                case 'select' : space.append(this.createSelect(e)); break;
                case 'file' : space.append(this.createFile(e)); break;
                case 'toggle' : space.append(this.createToggle(e)); break;
            }
        });
    }

}