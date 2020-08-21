import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowseComponent } from './components/pages/browse/browse/browse.component';
import { AddpartsComponent } from './components/pages/browse/addparts/addparts.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'browse',
    pathMatch: 'full',
  },
  {
    path: 'browse',
    component: BrowseComponent,
  },
  {
    path: 'browse/add/:id',
    component: AddpartsComponent,
  },
  {
    path: 'browse/add',
    component: AddpartsComponent,
  },
  {
    path: '**',
    redirectTo: 'browse',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
