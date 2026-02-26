// import { Exclude } from 'class-transformer';
// import { Course } from 'src/courses/entities/course.entity';
// import { Role } from 'src/roles/entities/role.entity';
// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   ManyToMany,
//   ManyToOne,
//   OneToMany,
//   PrimaryGeneratedColumn,
//   UpdateDateColumn,
// } from 'typeorm';

// @Entity('users')
// export class User {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;
//   @Column({ type: `varchar` })
//   username: string;
//   @Exclude()
//   @Column({ type: `varchar` })
//   password: string;
//   @ManyToOne(() => Role, (role) => role.users)
//   role: Role;

//   @OneToMany(() => Course, (course) => course.teacher)
//   courses: Course[];
//   @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
//   createdAt: Date;

//   @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
//   updatedAt: Date;
// }

import { Exclude } from 'class-transformer';
import { Course } from 'src/courses/entities/course.entity';
import { Role } from 'src/common/enums/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  // 🔥 Endi relation yo‘q — enum
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STUDENT,
  })
  role: Role;

  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}