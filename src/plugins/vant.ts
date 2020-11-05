import { App } from 'vue'
import { 
  Button,
  Field,
  Checkbox,
  Popup,
  Picker,
  Icon,
  Tabbar,
  TabbarItem,
  Image as VanImage,
  CellGroup,
  Cell,
  Dialog
} from 'vant'

export default function(app: App){
  app.use(Button)
  app.use(Field)
  app.use(Checkbox)
  app.use(Popup)
  app.use(Picker)
  app.use(Icon)
  app.use(Tabbar)
  app.use(TabbarItem)
  app.use(VanImage)
  app.use(Cell)
  app.use(CellGroup)
  app.use(Dialog)
}