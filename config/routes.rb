Rails.application.routes.draw do
  get 'vis/heatmap' => 'render_view#heatmap'
  get 'vis/index' => 'render_view#index'
  get 'vis/mark' => 'mark_view#marking'
  get 'vis/create' => 'create_view#overview'
  
  # fetch route. pass the controller and its attributes as query string parameters to get a json response
  # http://{root}/vis/fetch/pass?project_id=all&prototype_id=1&task_id=all&participant_id=all
  get 'vis/:action/:controller/'
  get 'passes/index' => 'pass#index'
  get 'overview' => 'project#overview'
  
  match 'vis/markers/create', to: 'markers#create', via: 'post'
end
