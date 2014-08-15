class TasksController < ApplicationController
  def fetch
    params[:task_id] == "all" ? @task_by_query = Task.all : @task_by_query = Task.where("id = " + params[:task_id])
    render json: @task_by_query, root: false
    # find JSON definition in the serializer
    # prepare for multiple projects
  end
end
