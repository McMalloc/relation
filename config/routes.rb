Rails.application.routes.draw do
  get 'heatmap' => 'render_view#heatmap'
  get 'mark' => 'mark_view#marking'
  get 'populate' => 'create_view#overview'
  #get 'vis/create/new_task' => 'create_view#new_task', as: :new_task
  
  # fetch route. pass the controller and its attributes as query string parameters to get a json response
  # http://{root}/vis/fetch/pass?project_id=all&prototype_id=1&task_id=all&participant_id=all
  get 'fetch/:action/:controller/'
  get 'passes/index' => 'pass#index'
  get 'overview' => 'project#overview'
  
  # Backbone.sync routes
  scope '/sync' do
    resources :tasks, :participants, :pass
    # put 'tasks' => 'tasks#update' # TODO: hack
    # delete 'tasks' => 'tasks#delete'
  end
  
  resources :projects, :markers
  # match 'markers/create', to: 'markers#create', via: 'post'
end
