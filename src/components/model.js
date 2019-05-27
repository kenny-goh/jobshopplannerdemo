/**
 * TODO: Clean up code debt
 * TODO: Remove hard codings
 * @author Kenny Goh
 */

var ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

class Company {

    constructor(name) {
        this.id = ID()
        this.name = name;
        this.resources = []
        this.orders = []
        this.operatingHours = 24
    }
    
    addResource(name, operationName, speed) {
        var resource = new Resource(name, operationName, speed)
        this.resources.push(resource)
        resource.setCompany(this);
        return resource;
    }

    addOrder(name, quantity, due) {
        var order = new Order(this, name, quantity, due);
        this.orders.push(order)
        return order;
    }

    unplanAll() {
        this.resources.forEach(function (each) {
            each.unplan();
        });
    }

    get kpi_orders_planned() {
        let planned_vectors = this.orders.map((x) => x.planned ? 1 : 0);
        let planned = planned_vectors.reduce((total,x) => total + x);
        let avg = (planned / this.orders.length) * 100;
        return Math.round(avg,0);  
    }

    get kpi_utilization() {
        let values = this.resources.map(x=>x.utilization);
        let sum = values.reduce((total,x)=>total + x);
        let avg = (sum / this.resources.length) * 100;
        return Math.round(avg,0);
    }

    get kpi_ontime() {
        if (this.orders.length > 0) {
            let on_time_vectors = this.orders.map((x) => x.planned && x.on_time ? 1 : 0);
            let planned_vectors = this.orders.map((x) => x.planned ? 1 : 0);
            let on_time = on_time_vectors.reduce((total,x) => total + x);
            let planned = planned_vectors.reduce((total,x) => total + x);
            let result = planned ? (on_time / planned) * 100 : 0;
            return Math.round(result, 0);
        }
        return 0;
    }
}

class OperationResource {
    constructor(operation, resource) {
        this.operation = operation;
        this.resource = resource;
    }
}

class Resource {
    constructor(name, operationName, speed) {
        this.id = ID()
        this.name = name;
        this.operationName = operationName;
        this.speed = speed;
        this.tasks = [];
    }

    setCompany(company) {
        this.company = company;
    }

    addOperationAsTask(operation) {
        var task = new Task();
        task.setOperation(operation);
        this.tasks.push(task);
        task.setParent(this);
        return task;
    }

    checkCircularity(task) {
        let circularity = task.parent.tasks.some( (x)=>{return this.tasks.some( (y)=>{ return x.operation.order == y.operation.order && x.operation.index < y.operation.index })});
        return this.tasks.length == 0 || ! circularity   
    }

    checkTaskAllowedOnResource(task) {
        return this.operationName == task.operation.name
    }

    checkAllowedToPlan(task) {
        if (!this.checkTaskAllowedOnResource(task)) return 'task not allowed on resource due to operation type';
        if (!this.checkCircularity(task)) return 'Circularity logic detected. Please plan from left to right';
        return '';
    }

    addTask(task) {
        this.tasks.push(task);
        task.setParent(this);
    }


    removeTask(task) {
        this.tasks.splice(task.index, 1);
        task.setParent(null);
    }

    unplan() {
        if (this.tasks.length > 0) {
            for (var i = this.tasks.length - 1; i >= 0; i--) {
                let task = this.tasks[i];
                task.unplan();
            }
        }
    }

    getTask(index) {
        return this.tasks[index];
    }

    get utilization() {
        return this.duration / this.company.operatingHours
    }
  
    get duration() {
        let durations = this.tasks.map(x=>x.duration);
        return durations.length > 0 ? durations.reduce((total,x)=>total + x) : 0;
    }


}

class Task {

    constructor() {
        this.id = ID();
    }

    get index() {
        return this.parent ? this.parent.tasks.indexOf(this) : -1;
    }

    get end() {
        return this.start + this.duration;
    }

    setParent(parent) {
        this.parent = parent
    }

    setOperation(operation) {
        this.operation = operation;
        if (operation) {
            operation.setTask(this);
        }
    }

    unplan() {
        this.parent.removeTask(this);
        this.operation.setTask(null);
        this.setParent(null);
        this.setOperation(null);
    }

    get duration() {
        return this.operation.order.qty / this.parent.speed;
    }

    get previous() {
        return this.index > 0 ? this.parent.getTask(this.index - 1) : null;
    }

    get start() {
        let previousTaskEnd = this.previous ? this.previous.end : 0;
        let operationEarliestStart = this.operation.earliestStart;
        return Math.max(previousTaskEnd, operationEarliestStart)
    }
}

class Order {
    constructor(company, name, qty, due) {
        this.id = ID();
        this.name = name;
        this.qty = qty;
        this.due = due;
    
        this.operations = []
        this.createOperation("Assembly");
        this.createOperation("Painting");
        this.company = company;
    }

    createOperation(name) {
        var op = new Operation(name)
        op.setOrder(this);
        this.operations.push(op);
        return op;
    }


    getOperation(index) {
        return this.operations[index];
    }

    get plannedAsString() {
        return this.planned.toString();
    }

    get planned() {
        return this.operations.every(op => op.planned);
    }

    get end() {
        return Math.max(...this.operations.map((x)=>{return x.end}))
    }

    get on_time() {
        return this.end <= this.due;
    }

    plan() {
        this.operations.forEach(function (each) {
            if (!each.planned) {
                each.plan();
            }
        });
    }
}

class Operation {
    constructor(name) {
        this.id = ID();
        this.name = name;

    }

    get index() {
        return this.order ? this.order.operations.indexOf(this) : -1;
    }

    setOrder(order) {
        this.order = order;
    }

    setTask(task) {
        this.task = task;
    }

    get plannedAsString() {
        return this.planned.toString();
    }

    get planned() {
        return this.task ? true : false;
    }

    get previous() {
        return this.index > 0 ? this.order.getOperation(this.index - 1) : null;
    }

    get operationResources() {
        // object memory leak?
        let resources = this.order.company.resources.filter(x=> x.operationName == this.name);
        let operationResources = resources.map(x => new OperationResource(this, x));
        return operationResources;
    }

    get start() {
        return this.task ? this.task.start : 0;
    }

    get end() {
        return this.task ? this.task.end : 0
    }

    get earliestStart() {
        let previousEnd = this.previous ? this.previous.end : 0;
        return previousEnd;
    }

    plan() {
        //let resource = this.order.company.resources[0];
        let operationResources = this.operationResources;
        let selectedOperationResource = operationResources[Math.floor(Math.random() * Math.floor(operationResources.length))];
        selectedOperationResource.resource.addOperationAsTask(this);
        //resource.addOperationAsTask(this);
    }

    planOnResource(resourceName) {
        //let resource = this.order.company.resources[0];
        let operationResources = this.operationResources;
        let selectedOperationResource = operationResources.find(x=>x.resource.name == resourceName);
        selectedOperationResource.resource.addOperationAsTask(this);
        //resource.addOperationAsTask(this);
    }
}



module.exports = {
    Company: Company,
    Resource: Resource,
    Task: Task
}