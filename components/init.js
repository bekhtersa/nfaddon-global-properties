import { PlElement } from "polylib";
import { normalizePath } from "polylib/common";

const GlobalProps = new Map();
const _handlerProps = (e) => {
	const info = e.detail;
	const path = normalizePath(info.path);
	const Prop = GlobalProps.get(path.at(0));
	
	if(!Prop) {
		console.error(`global prop not found ${path.at(0)}`);
		return;
	}

	Prop.value = info.value;

	Prop?.elements.forEach((f)=>{
		if( info.action === 'upd' ){
			if( info.value === f.get(info.path) ){
				f.notifyChange(info);
			}else{
				f.set(info.path, info.value);
			}
		} else if( info.action === 'splice' && info.deletedCount === undefined ) {
			f.notifyChange(info);
		} else if( info.action === 'splice' && info.deletedCount >=0 ){
			f.notifyChange(info);
		}	
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
			this.notifyChange({ action: 'upd', path: p, value: this._dp[p].value !== this._props[p] ? this._props[p] : this._dp[p].value ?? Prop.value });
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
				Prop.elements.splice(Prop.elements.indexOf(this),1);
			}
		}
	});
}
