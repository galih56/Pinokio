type PathGroup = {
    path: string;
    getHref: (id?: string) => string;
    icon?: any; // assuming 'icon' is a React component type, e.g., an SVG icon
};

type Paths = {
    [key: string]: PathGroup ;
};