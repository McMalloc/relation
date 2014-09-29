class TasksController < ApplicationController
  def fetch
    params[:task_id] == "all" ? @task_by_query = Task.all : @task_by_query = Task.where("id = " + params[:task_id])
    render json: @task_by_query, root: false
    # find JSON definition in the serializer
    # prepare for multiple projects
  end
  
  def index
    @tasks = Task.all
    render json: @tasks, root: false
  end
  
  def show
    @task = Task.find(params[:id])
  end
  
  def create
    @new_task = Task.create(task_params)
    render json: @new_task, root: false
  end
  
  def update
    # @task = Task.find(params[:id])
    @task = Task.find(params[:id])
    @task.update_attributes(task_params)
    render json: @task, root: false, status: :ok
  end  
  
  def destroy
    puts params.to_yaml
    @task = Task.find(params[:id])
    @task.destroy
    head :no_content # 204 status code for deleting
  end
  
  def task_params
    params.require(:task).permit!
  end
end