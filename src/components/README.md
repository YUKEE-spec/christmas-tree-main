# 礼物配置模块

这个模块提供了完整的圣诞树礼物配置功能，让用户可以自定义礼物的外观、数量、分布和动画效果。

## 文件结构

- `GiftConfig.tsx` - 礼物配置界面和类型定义
- `EnhancedGifts.tsx` - 增强的礼物渲染组件

## 主要功能

### 🎁 礼物类型配置
- **8种预设礼物类型**：经典红盒、金色球、银色筒、蓝色盒、绿色球、紫色星、粉色心、橙色盒
- **5种几何形状**：盒子、球体、圆柱、星形、心形
- **自定义礼物**：用户可以添加自定义礼物，设置颜色、形状、大小等属性

### 📊 数量和分布
- **4种数量选项**：少量(30)、适中(60)、丰富(100)、满载(150)
- **4种分布模式**：
  - 螺旋分布：沿着树的螺旋线分布
  - 随机分布：完全随机位置
  - 层次分布：按层次有序分布
  - 集中分布：聚集在特定区域

### ✨ 视觉效果
- **亮度调节**：0.5-2.0倍亮度调节
- **材质属性**：每个礼物都有独立的金属度、粗糙度、发光强度
- **透明度**：95%透明度，营造水晶质感

### 🎬 动画效果
- **摆动动画**：轻微的左右摆动
- **旋转动画**：持续旋转效果
- **浮动动画**：上下浮动效果

## 使用方法

1. 点击"礼物"按钮打开配置面板
2. 选择礼物数量和分布模式
3. 调节整体亮度
4. 选择要显示的礼物类型
5. 可以添加自定义礼物类型
6. 设置动画效果选项

## 技术特点

- **模块化设计**：独立的配置和渲染组件
- **类型安全**：完整的TypeScript类型定义
- **性能优化**：使用useMemo缓存几何体和材质
- **响应式UI**：适配不同屏幕尺寸的配置界面
- **实时预览**：配置更改立即反映在3D场景中

## 配置选项详解

### GiftType 接口
```typescript
interface GiftType {
  id: string;           // 唯一标识符
  name: string;         // 显示名称
  shape: string;        // 几何形状
  color: string;        // 颜色值
  size: number;         // 尺寸倍数
  metalness: number;    // 金属度 0-1
  roughness: number;    // 粗糙度 0-1
  emissiveIntensity: number; // 发光强度
}
```

### GiftConfig 接口
```typescript
interface GiftConfig {
  enabled: boolean;           // 是否启用
  count: number;             // 礼物数量
  distribution: string;      // 分布模式
  selectedTypes: string[];   // 选中的类型ID
  customTypes: GiftType[];   // 自定义类型
  brightness: number;        // 整体亮度
  animation: {              // 动画设置
    wobble: boolean;
    rotation: boolean;
    floating: boolean;
  };
}
```