# @nfaddon/global-properties

Для любого компонента унаследованного от PlElement (в том числе и PLForm)
флаг global у свойтсва уведомляет все другие компоненты
с таким же именем свойства и флагом global

``` js
class Component extends PlElement {
    static properties = {
        propName: { type: String, global: true}
    }
}

class OtherComponentOrForm extends PlForm {
    static properties = {
        propName: { type: String, global: true}
    }
}
```