import React from 'react';

export const TechIcon: React.FC<{
    name: 'settings' | 'light' | 'gift' | 'photo' | 'snow' | 'magic' | 'music' | 'close' | 'download' | 'edit' | 'check' | 'plus';
    size?: number;
    color?: string;
    className?: string;
}> = ({ name, size = 20, color = 'currentColor', className }) => {
    const getPath = () => {
        switch (name) {
            case 'settings':
                // 粒子风格齿轮
                return (
                    <g fill={color}>
                        <circle cx="12" cy="12" r="3" opacity="0.8" />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                            <circle
                                key={i}
                                cx={12 + Math.cos(deg * Math.PI / 180) * 7}
                                cy={12 + Math.sin(deg * Math.PI / 180) * 7}
                                r="1.5"
                            />
                        ))}
                    </g>
                );
            case 'light':
                // 粒子灯泡
                return (
                    <g fill={color}>
                        <circle cx="12" cy="10" r="5" opacity="0.6" />
                        <circle cx="12" cy="10" r="2" opacity="1" />
                        <rect x="10" y="16" width="4" height="2" rx="1" />
                        <rect x="10" y="19" width="4" height="2" rx="1" />
                        {[-30, 0, 30].map((deg, i) => (
                            <rect
                                key={i}
                                x="11.5"
                                y="2"
                                width="1"
                                height="3"
                                transform={`rotate(${deg}, 12, 10)`}
                                opacity="0.8"
                            />
                        ))}
                    </g>
                );
            case 'gift':
                // 粒子礼物盒
                return (
                    <g fill={color}>
                        <rect x="4" y="8" width="16" height="12" rx="1" opacity="0.3" />
                        <rect x="11" y="8" width="2" height="12" opacity="0.8" />
                        <rect x="4" y="13" width="16" height="2" opacity="0.8" />
                        <circle cx="12" cy="6" r="2" />
                        <circle cx="9" cy="7" r="1.5" />
                        <circle cx="15" cy="7" r="1.5" />
                    </g>
                );
            case 'photo':
                // 粒子相框
                return (
                    <g fill={color}>
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="1 3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M4 17 L9 12 L14 16 L17 13 L20 16" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </g>
                );
            case 'snow':
                // 粒子雪花
                return (
                    <g fill={color}>
                        <circle cx="12" cy="12" r="1.5" />
                        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                            <g key={i} transform={`rotate(${deg}, 12, 12)`}>
                                <circle cx="12" cy="7" r="1" />
                                <circle cx="12" cy="4" r="0.8" />
                                <circle cx="10.5" cy="8.5" r="0.6" />
                                <circle cx="13.5" cy="8.5" r="0.6" />
                            </g>
                        ))}
                    </g>
                );
            case 'magic':
                // 粒子魔法棒/星星
                return (
                    <g fill={color}>
                        <path d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18 22 L11.5 17.5 L5 22 L7 14.5 L1 9.5 L8.5 9 Z" opacity="0.5" />
                        <circle cx="12" cy="12" r="2" opacity="1" fill="#fff" />
                        <circle cx="6" cy="6" r="1" opacity="0.8" />
                        <circle cx="18" cy="18" r="1" opacity="0.8" />
                        <circle cx="18" cy="6" r="1" opacity="0.8" />
                        <circle cx="6" cy="18" r="1" opacity="0.8" />
                    </g>
                );
            case 'music':
                // 粒子音符
                return (
                    <g fill={color}>
                        <circle cx="8" cy="18" r="3" opacity="0.8" />
                        <circle cx="18" cy="16" r="3" opacity="0.8" />
                        <rect x="10" y="5" width="2" height="13" opacity="0.8" />
                        <rect x="19" y="3" width="2" height="13" opacity="0.8" />
                        <path d="M10 5 L19 3 L19 8 L10 10 Z" opacity="0.8" />
                    </g>
                );
            case 'close':
                // 粒子叉号
                return (
                    <g fill={color}>
                        {[0, 90].map((deg, i) => (
                            <rect key={i} x="11" y="4" width="2" height="16" rx="1" transform={`rotate(${deg + 45}, 12, 12)`} />
                        ))}
                    </g>
                );
            case 'check':
                // 粒子对钩
                return (
                    <g stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none">
                        <path d="M5 12 L10 17 L19 6" strokeDasharray="0.1 4" strokeDashoffset="0" />
                        <circle cx="5" cy="12" r="1" fill={color} stroke="none" />
                        <circle cx="10" cy="17" r="1" fill={color} stroke="none" />
                        <circle cx="19" cy="6" r="1" fill={color} stroke="none" />
                    </g>
                );
            case 'plus':
                // 粒子加号
                return (
                    <g fill={color}>
                        <rect x="11" y="4" width="2" height="16" rx="1" />
                        <rect x="4" y="11" width="16" height="2" rx="1" />
                    </g>
                );
            case 'download':
                // 粒子下载
                return (
                    <g fill={color}>
                        <rect x="11" y="3" width="2" height="10" rx="1" />
                        <path d="M7 11 L12 16 L17 11" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
                        <rect x="5" y="19" width="14" height="2" rx="1" opacity="0.6" />
                    </g>
                );
            case 'edit':
                // 粒子编辑笔
                return (
                    <g fill={color}>
                        <path d="M15 3 L20 8 L8 20 L3 21 L4 16 Z" stroke={color} strokeWidth="1.5" fill="none" />
                        <circle cx="17.5" cy="5.5" r="1" />
                        <circle cx="5.5" cy="18.5" r="1" />
                    </g>
                );
        }
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ display: 'inline-block', verticalAlign: 'middle' }}
        >
            {getPath()}
        </svg>
    );
};
