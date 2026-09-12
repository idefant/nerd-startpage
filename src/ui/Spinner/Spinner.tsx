import classNames from 'classnames';
import { FC } from 'react';

import cls from './Spinner.module.scss';

interface SpinnerProps {
  size?: 'small' | 'middle';
  className?: string;
}

const Spinner: FC<SpinnerProps> = ({ size = 'small', className }) => (
  <div className={classNames(cls.spinner, cls[size], className)} />
);

export default Spinner;
