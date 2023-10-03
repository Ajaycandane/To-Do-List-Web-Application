const firebaseConfig = {
    apiKey: "AIzaSyCsoPQePS3IHMeTM27XeqfU1HV3KLnwzSI",
    authDomain: "to-do-list-aj.firebaseapp.com",
    projectId: "to-do-list-aj",
    storageBucket: "to-do-list-aj.appspot.com",
    messagingSenderId: "58055679255",
    appId: "1:58055679255:web:b5fb21cb22fdbb1e1c2b52",
    measurementId: "G-DCERZBB4Q0",
    persistence: true
};


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", async ()=>{
    const list_el = document.getElementById("list");
    const create_btn_el = document.getElementById("create");
    let todos = [];

    create_btn_el.addEventListener('click', CreateNewTodo);

    async function loadTodos() {
        try {
            const querySnapshot = await firebase.firestore().collection("todos").get();
            todos = [];
            querySnapshot.forEach((doc) => {
                const todo = doc.data();
                todos.unshift(todo);
                const { item_el, input_el, edit_btn_el } = CreateTodoElement(todo);
                if (todo.complete) {
                    item_el.classList.add("complete");
                    input_el.setAttribute("disabled", "");
                } else {
                    item_el.classList.add("not-complete");
                }
                list_el.prepend(item_el);
            });
        } catch (error) {
            console.error("Error fetching data from Firestore:", error);
        }
    }

  
    await loadTodos();



    function CreateNewTodo() {
        const dynamicInputId = "dynamic-input-" + new Date().getTime();
        const input_el = document.createElement("input");
        input_el.type = "text";
        input_el.id = dynamicInputId;

        const item = {
            id: new Date().getTime(),
            text: "",
            complete: false
        };

        todos.unshift(item);

        const completedItems = todos.filter(t => t.complete);
        const notCompletedItems = todos.filter(t => !t.complete);

        todos = completedItems.concat(notCompletedItems);

        const { item_el, edit_btn_el, remove_btn_el, checkbox, input_el: todoInput_el } = CreateTodoElement(item);
        list_el.prepend(item_el);

        firebase.firestore().collection("todos").doc(item.id.toString()).set(item)
            .then(() => {
                console.log("Document successfully written!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });

        todoInput_el.removeAttribute("disabled");
        todoInput_el.focus();

        edit_btn_el.addEventListener("click", () => {
            todoInput_el.removeAttribute("disabled");
            todoInput_el.focus();

            todoInput_el.addEventListener("blur", () => {
                todoInput_el.setAttribute("disabled", "");
            });
        });
        
    }

    function CreateTodoElement(item) {
        const item_el = document.createElement("div");
        item_el.classList.add("item");

        const input_el = document.createElement("input");
        input_el.type = "text";
        input_el.value = item.text;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("bubble");
        checkbox.checked = item.complete;

        const actions_el = document.createElement("div");
        actions_el.classList.add("actions");

        const edit_btn_el = document.createElement("button");
        edit_btn_el.classList.add("material-symbols-outlined");
        edit_btn_el.innerText = "edit";

        const remove_btn_el = document.createElement("button");
        remove_btn_el.classList.add("material-symbols-outlined", "remove");
        remove_btn_el.innerText = "delete";

        actions_el.append(edit_btn_el);
        actions_el.append(remove_btn_el);

        item_el.append(checkbox);
        item_el.append(input_el);
        item_el.append(actions_el);

        input_el.addEventListener("input", () => {
            item.text = input_el.value;
            firebase.firestore().collection("todos").doc(item.id.toString()).update({ text: item.text });
        });

        checkbox.addEventListener("change", () => {
            item.complete = checkbox.checked;
            firebase.firestore().collection("todos").doc(item.id.toString()).update({ complete: item.complete });

            if (item.complete) {
                item_el.classList.add("complete");
                item_el.classList.remove("not-complete");
                input_el.setAttribute("disabled", "");
            } else {
                item_el.classList.remove("complete");
                item_el.classList.add("not-complete");
                input_el.removeAttribute("disabled");
                input_el.focus();
            }
        });

        input_el.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                
                event.preventDefault();
        
    
                item.text = input_el.value;
                firebase.firestore().collection("todos").doc(item.id.toString()).update({ text: item.text });
                
               
                if (item.complete) {
                    input_el.setAttribute("disabled", "");
                }
                if (item.complete) {
                    item_el.classList.add("complete");
                    item_el.classList.remove("not-complete");
                } else {
                    item_el.classList.remove("complete");
                    item_el.classList.add("not-complete");
                }
               
               
                edit_btn_el.focus();
            }
        });

        edit_btn_el.addEventListener("click", () => {
            input_el.removeAttribute("disabled");
            input_el.focus();
        });

    remove_btn_el.addEventListener("click", () => {
        todos = todos.filter(t => t.id !== item.id);
        item_el.remove();
        item_el.remove();

       
        firebase.firestore().collection("todos").doc(item.id.toString()).delete()
            .then(() => {
                console.log("Document successfully deleted from Firestore!");
            })
            .catch((error) => {
                console.error("Error deleting document: ", error);
            });
    });

    return { item_el, edit_btn_el, remove_btn_el, checkbox, input_el };
}

})
