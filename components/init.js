import { PlElement } from "polylib";

const GlobalProps = new Map();
const _handlerProps = (e) => {
	const info = e.detail;

	const Prop = GlobalProps.get(info.path);

	if (Prop.value === info.value) {
		if(Prop.value !== e.target._props[info.path])
			e.target.set(info.path, info.value);
		return;
	}
	Prop.value = info.value;
	Prop?.elements.forEach((f)=>{
		f.set(info.path, info.value);
	});
}
const ccB = PlElement.prototype.connectedCallback;
PlElement.prototype.connectedCallback = function(){
	ccB.call(this);
	Object.keys(this._dp).forEach( p => {
		if (this._dp[p].global) {
			if(!GlobalProps.has(p)){
				GlobalProps.set(p, { value: undefined, elements: [] });
			}
			const Prop = GlobalProps.get(p);
			Prop.elements.push(this);
			this.addEventListener(`${p}-changed`, _handlerProps);
			this.notifyChange({ action: 'upd', path: p, value: this._dp[p].value ?? Prop.value });
		}
	});
}
const dcB = PlElement.prototype.disconnectedCallback;
PlElement.prototype.disconnectedCallback = function(){
	dcB.call(this);
	Object.keys(this._dp).forEach( p => {
		if (this._dp[p].global) {
			if(GlobalProps.has(p)){
				const Prop = GlobalProps.get(p);
				this.removeEventListener(`${p}-changed`, _handlerProps);
				Prop.elements.splice(Prop.elements.indexOf(element),1);
			}
		}
	});
}
